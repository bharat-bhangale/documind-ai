import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";

import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

import { validEnv } from "./fixtures/env.js";

Object.assign(process.env, {
  ...validEnv,
  REFRESH_COOKIE_NAME: "documind_payment_refresh_token"
});

const mongoServer = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongoServer.getUri();

const { default: app } = await import("../src/app.js");
const { connectDatabase, disconnectDatabase } = await import("../src/config/database.js");
const { config } = await import("../src/config/env.js");
const { Payment } = await import("../src/features/payments/payment.model.js");
const { setPaymentGatewayProviderForTests } = await import("../src/features/payments/payment.provider.js");
const { User } = await import("../src/features/users/user.model.js");

function createCheckoutSignature({ orderId, paymentId }) {
  return crypto.createHmac("sha256", config.razorpayKeySecret).update(`${orderId}|${paymentId}`).digest("hex");
}

function createWebhookSignature(rawBody) {
  return crypto.createHmac("sha256", config.razorpayWebhookSecret).update(rawBody).digest("hex");
}

function createMockPaymentProvider() {
  const createdOrders = [];

  return {
    createdOrders,
    provider: {
      createOrder: async (payload) => {
        createdOrders.push(payload);

        return {
          id: `order_test_${createdOrders.length}`,
          amount: payload.amount,
          currency: payload.currency,
          receipt: payload.receipt,
          status: "created"
        };
      }
    }
  };
}

function createWebhookPayload({ event = "payment.captured", orderId, paymentId = "pay_test_1", amount, currency }) {
  return {
    event,
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount,
          currency,
          status: event === "payment.failed" ? "failed" : "captured"
        }
      }
    }
  };
}

async function registerUser(email = "payments.owner@example.com") {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Payments Owner",
      email,
      password: "Password123"
    })
    .expect(201);

  return {
    accessToken: response.body.data.accessToken,
    user: response.body.data.user
  };
}

async function createPaymentOrder(accessToken, body = {}) {
  return request(app)
    .post("/api/payments/orders")
    .set("Authorization", `Bearer ${accessToken}`)
    .send(body)
    .expect(201);
}

function sendWebhook({ payload, eventId = "evt_test_1", signatureOverride }) {
  const body = JSON.stringify(payload);
  const rawBody = Buffer.from(body);
  const signature = signatureOverride ?? createWebhookSignature(rawBody);

  return request(app)
    .post("/api/payments/webhook")
    .set("Content-Type", "application/json")
    .set("x-razorpay-signature", signature)
    .set("x-razorpay-event-id", eventId)
    .send(body);
}

test.before(async () => {
  await connectDatabase(process.env.MONGODB_URI);
});

test.after(async () => {
  await disconnectDatabase();
  await mongoServer.stop();
});

test.beforeEach(async () => {
  await Payment.deleteMany({});
  await User.deleteMany({});

  const mockGateway = createMockPaymentProvider();
  setPaymentGatewayProviderForTests(mockGateway.provider);
});

test("POST /api/payments/orders creates a Razorpay order with server-controlled amount", async () => {
  const mockGateway = createMockPaymentProvider();
  setPaymentGatewayProviderForTests(mockGateway.provider);
  const { accessToken } = await registerUser();

  const response = await createPaymentOrder(accessToken, {
    amount: 1,
    currency: "USD",
    plan: "free"
  });

  assert.equal(response.body.success, true);
  assert.equal(response.body.data.payment.amount, config.proPlanPricePaise);
  assert.equal(response.body.data.payment.currency, config.proPlanCurrency);
  assert.equal(response.body.data.checkout.amount, config.proPlanPricePaise);
  assert.equal(response.body.data.checkout.keyId, config.razorpayKeyId);
  assert.equal(response.body.data.checkout.orderId, "order_test_1");
  assert.equal(mockGateway.createdOrders.length, 1);
  assert.equal(mockGateway.createdOrders[0].amount, config.proPlanPricePaise);
  assert.equal(mockGateway.createdOrders[0].currency, config.proPlanCurrency);
  assert.equal(mockGateway.createdOrders[0].notes.plan, "pro");
});

test("POST /api/payments/verify verifies checkout signature and upgrades the user to Pro", async () => {
  const { accessToken, user } = await registerUser();
  const orderResponse = await createPaymentOrder(accessToken);
  const orderId = orderResponse.body.data.payment.orderId;
  const paymentId = "pay_valid_checkout";

  const response = await request(app)
    .post("/api/payments/verify")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: createCheckoutSignature({ orderId, paymentId })
    })
    .expect(200);

  assert.equal(response.body.data.userPlan, "pro");
  assert.equal(response.body.data.payment.status, "paid");
  assert.equal(response.body.data.payment.paymentId, paymentId);

  const updatedUser = await User.findById(user.id);
  assert.equal(updatedUser.plan, "pro");
});

test("POST /api/payments/verify rejects forged signatures without upgrading the user", async () => {
  const { accessToken, user } = await registerUser();
  const orderResponse = await createPaymentOrder(accessToken);
  const orderId = orderResponse.body.data.payment.orderId;

  const response = await request(app)
    .post("/api/payments/verify")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      razorpay_order_id: orderId,
      razorpay_payment_id: "pay_forged_checkout",
      razorpay_signature: "forged-signature"
    })
    .expect(400);

  assert.match(response.body.message, /Invalid Razorpay payment signature/);

  const updatedUser = await User.findById(user.id);
  const payment = await Payment.findOne({ razorpayOrderId: orderId });
  assert.equal(updatedUser.plan, "free");
  assert.equal(payment.status, "created");
});

test("POST /api/payments/verify does not let another user claim an order", async () => {
  const owner = await registerUser("payment.owner@example.com");
  const other = await registerUser("payment.other@example.com");
  const orderResponse = await createPaymentOrder(owner.accessToken);
  const orderId = orderResponse.body.data.payment.orderId;
  const paymentId = "pay_cross_user";

  await request(app)
    .post("/api/payments/verify")
    .set("Authorization", `Bearer ${other.accessToken}`)
    .send({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: createCheckoutSignature({ orderId, paymentId })
    })
    .expect(404);

  const updatedOther = await User.findById(other.user.id);
  assert.equal(updatedOther.plan, "free");
});

test("POST /api/payments/webhook verifies raw-body signature and upgrades paid orders", async () => {
  const { accessToken, user } = await registerUser();
  const orderResponse = await createPaymentOrder(accessToken);
  const orderId = orderResponse.body.data.payment.orderId;
  const payload = createWebhookPayload({
    orderId,
    paymentId: "pay_webhook_captured",
    amount: config.proPlanPricePaise,
    currency: config.proPlanCurrency
  });

  const response = await sendWebhook({ payload, eventId: "evt_payment_captured_1" }).expect(200);

  assert.equal(response.body.data.processed, true);
  assert.equal(response.body.data.payment.status, "paid");

  const updatedUser = await User.findById(user.id);
  assert.equal(updatedUser.plan, "pro");
});

test("POST /api/payments/webhook is idempotent for duplicate event ids", async () => {
  const { accessToken } = await registerUser();
  const orderResponse = await createPaymentOrder(accessToken);
  const orderId = orderResponse.body.data.payment.orderId;
  const payload = createWebhookPayload({
    orderId,
    paymentId: "pay_duplicate_event",
    amount: config.proPlanPricePaise,
    currency: config.proPlanCurrency
  });

  await sendWebhook({ payload, eventId: "evt_duplicate_payment" }).expect(200);
  const duplicateResponse = await sendWebhook({ payload, eventId: "evt_duplicate_payment" }).expect(200);

  assert.equal(duplicateResponse.body.data.duplicate, true);

  const payment = await Payment.findOne({ razorpayOrderId: orderId }).select("+webhookEventIds");
  assert.equal(payment.status, "paid");
  assert.deepEqual(payment.webhookEventIds, ["evt_duplicate_payment"]);
});

test("POST /api/payments/webhook rejects forged signatures without upgrading the user", async () => {
  const { accessToken, user } = await registerUser();
  const orderResponse = await createPaymentOrder(accessToken);
  const orderId = orderResponse.body.data.payment.orderId;
  const payload = createWebhookPayload({
    orderId,
    paymentId: "pay_bad_webhook",
    amount: config.proPlanPricePaise,
    currency: config.proPlanCurrency
  });

  const response = await sendWebhook({
    payload,
    eventId: "evt_forged_webhook",
    signatureOverride: "forged-webhook-signature"
  }).expect(400);

  assert.match(response.body.message, /Invalid Razorpay webhook signature/);

  const updatedUser = await User.findById(user.id);
  const payment = await Payment.findOne({ razorpayOrderId: orderId });
  assert.equal(updatedUser.plan, "free");
  assert.equal(payment.status, "created");
});

test("POST /api/payments/webhook records failed payments without upgrading the user", async () => {
  const { accessToken, user } = await registerUser();
  const orderResponse = await createPaymentOrder(accessToken);
  const orderId = orderResponse.body.data.payment.orderId;
  const payload = createWebhookPayload({
    event: "payment.failed",
    orderId,
    paymentId: "pay_failed_webhook",
    amount: config.proPlanPricePaise,
    currency: config.proPlanCurrency
  });

  const response = await sendWebhook({ payload, eventId: "evt_payment_failed_1" }).expect(200);

  assert.equal(response.body.data.processed, true);
  assert.equal(response.body.data.payment.status, "failed");

  const updatedUser = await User.findById(user.id);
  assert.equal(updatedUser.plan, "free");
});

test("GET /api/payments/history returns user-scoped sanitized payment history", async () => {
  const owner = await registerUser("payment-history-owner@example.com");
  const other = await registerUser("payment-history-other@example.com");
  const orderResponse = await createPaymentOrder(owner.accessToken);
  const orderId = orderResponse.body.data.payment.orderId;
  const paymentId = "pay_history";

  await request(app)
    .post("/api/payments/verify")
    .set("Authorization", `Bearer ${owner.accessToken}`)
    .send({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: createCheckoutSignature({ orderId, paymentId })
    })
    .expect(200);

  await createPaymentOrder(other.accessToken);

  const response = await request(app)
    .get("/api/payments/history")
    .set("Authorization", `Bearer ${owner.accessToken}`)
    .expect(200);

  assert.equal(response.body.data.payments.length, 1);
  assert.equal(response.body.data.payments[0].paymentId, paymentId);
  assert.equal(response.body.data.payments[0].signature, undefined);
  assert.equal(response.body.data.payments[0].webhookEventIds, undefined);
  assert.equal(response.body.data.payments[0].rawGatewayPayload, undefined);
});
