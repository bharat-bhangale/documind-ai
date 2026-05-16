import { config } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { User } from "../users/user.model.js";
import {
  PAYMENT_PLAN,
  PAYMENT_PROVIDER,
  PAYMENT_SOURCE,
  PAYMENT_STATUS,
  RAZORPAY_WEBHOOK_EVENT
} from "./payment.constants.js";
import { Payment } from "./payment.model.js";
import { getPaymentGatewayProvider } from "./payment.provider.js";
import { serializePayment } from "./payment.serializer.js";
import { isValidCheckoutSignature, isValidWebhookSignature } from "./payment.security.js";

function buildReceipt(userId) {
  return `dm_${Date.now()}_${String(userId).slice(-8)}`;
}

function buildCheckoutOptions({ user, payment }) {
  return {
    keyId: config.razorpayKeyId,
    orderId: payment.razorpayOrderId,
    amount: payment.amount,
    currency: payment.currency,
    name: "DocuMind Pro",
    description: "DocuMind Pro plan upgrade",
    prefill: {
      name: user.name,
      email: user.email
    },
    theme: {
      color: "#2563eb"
    }
  };
}

function parseWebhookPayload(rawBody) {
  try {
    return JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : String(rawBody ?? ""));
  } catch {
    throw new AppError("Invalid Razorpay webhook payload.", 400);
  }
}

function getPaymentEntity(payload) {
  return payload?.payload?.payment?.entity ?? null;
}

function getWebhookEventKey({ eventId, event, paymentId }) {
  if (eventId) {
    return eventId;
  }

  if (event && paymentId) {
    return `${event}:${paymentId}`;
  }

  return null;
}

function assertPaymentAmount(payment, entity) {
  if (Number(entity.amount) !== payment.amount || String(entity.currency).toUpperCase() !== payment.currency) {
    throw new AppError("Razorpay payment amount does not match the server order.", 400);
  }
}

async function markPaymentPaid({ payment, paymentId, source, eventKey }) {
  if (eventKey && payment.webhookEventIds.includes(eventKey)) {
    return {
      payment,
      duplicate: true
    };
  }

  if (eventKey) {
    payment.webhookEventIds.push(eventKey);
  }

  if (payment.status !== PAYMENT_STATUS.PAID) {
    payment.status = PAYMENT_STATUS.PAID;
    payment.source = source;
    payment.razorpayPaymentId = payment.razorpayPaymentId || paymentId;
    payment.paidAt = payment.paidAt || new Date();
  }

  await payment.save();
  await User.updateOne({ _id: payment.user }, { $set: { plan: PAYMENT_PLAN.PRO } });

  return {
    payment,
    duplicate: false
  };
}

async function markPaymentFailed({ payment, paymentId, eventKey }) {
  if (eventKey && payment.webhookEventIds.includes(eventKey)) {
    return {
      payment,
      duplicate: true
    };
  }

  if (eventKey) {
    payment.webhookEventIds.push(eventKey);
  }

  if (payment.status !== PAYMENT_STATUS.PAID) {
    payment.status = PAYMENT_STATUS.FAILED;
    payment.source = PAYMENT_SOURCE.WEBHOOK;
    payment.razorpayPaymentId = payment.razorpayPaymentId || paymentId;
    payment.failedAt = payment.failedAt || new Date();
  }

  await payment.save();

  return {
    payment,
    duplicate: false
  };
}

export async function createProPaymentOrder({ user }) {
  if (user.plan === PAYMENT_PLAN.PRO) {
    throw new AppError("Your account is already on the Pro plan.", 409);
  }

  const receipt = buildReceipt(user.id);
  const orderPayload = {
    amount: config.proPlanPricePaise,
    currency: config.proPlanCurrency,
    receipt,
    notes: {
      userId: user.id,
      plan: PAYMENT_PLAN.PRO
    }
  };
  const order = await getPaymentGatewayProvider().createOrder(orderPayload);

  const payment = await Payment.create({
    user: user.id,
    plan: PAYMENT_PLAN.PRO,
    provider: PAYMENT_PROVIDER.RAZORPAY,
    razorpayOrderId: order.id,
    amount: config.proPlanPricePaise,
    currency: config.proPlanCurrency,
    receipt,
    status: PAYMENT_STATUS.CREATED,
    source: PAYMENT_SOURCE.CHECKOUT
  });

  return {
    payment: serializePayment(payment),
    checkout: buildCheckoutOptions({ user, payment })
  };
}

export async function verifyProPayment({ user, orderId, paymentId, signature }) {
  const signatureIsValid = isValidCheckoutSignature({
    orderId,
    paymentId,
    signature,
    secret: config.razorpayKeySecret
  });

  if (!signatureIsValid) {
    throw new AppError("Invalid Razorpay payment signature.", 400);
  }

  const payment = await Payment.findOne({
    user: user.id,
    razorpayOrderId: orderId
  }).select("+webhookEventIds");

  if (!payment) {
    throw new AppError("Payment order not found.", 404);
  }

  const result = await markPaymentPaid({
    payment,
    paymentId,
    source: PAYMENT_SOURCE.CHECKOUT
  });

  return {
    payment: serializePayment(result.payment),
    userPlan: PAYMENT_PLAN.PRO,
    duplicate: result.duplicate
  };
}

export async function processRazorpayWebhook({ rawBody, signature, eventId }) {
  if (!config.razorpayWebhookSecret) {
    throw new AppError("Razorpay webhook secret is not configured.", 503);
  }

  if (!signature) {
    throw new AppError("Razorpay webhook signature is required.", 400);
  }

  const signatureIsValid = isValidWebhookSignature({
    rawBody,
    signature,
    secret: config.razorpayWebhookSecret
  });

  if (!signatureIsValid) {
    throw new AppError("Invalid Razorpay webhook signature.", 400);
  }

  const payload = parseWebhookPayload(rawBody);
  const entity = getPaymentEntity(payload);

  if (!entity?.order_id || !entity?.id) {
    return {
      processed: false,
      ignored: true,
      event: payload.event || null
    };
  }

  const eventKey = getWebhookEventKey({
    eventId,
    event: payload.event,
    paymentId: entity.id
  });
  const payment = await Payment.findOne({ razorpayOrderId: entity.order_id }).select("+webhookEventIds");

  if (!payment) {
    return {
      processed: false,
      ignored: true,
      event: payload.event || null
    };
  }

  if (payload.event === RAZORPAY_WEBHOOK_EVENT.PAYMENT_CAPTURED) {
    assertPaymentAmount(payment, entity);

    const result = await markPaymentPaid({
      payment,
      paymentId: entity.id,
      source: PAYMENT_SOURCE.WEBHOOK,
      eventKey
    });

    return {
      processed: true,
      duplicate: result.duplicate,
      payment: serializePayment(result.payment)
    };
  }

  if (payload.event === RAZORPAY_WEBHOOK_EVENT.PAYMENT_FAILED) {
    const result = await markPaymentFailed({
      payment,
      paymentId: entity.id,
      eventKey
    });

    return {
      processed: true,
      duplicate: result.duplicate,
      payment: serializePayment(result.payment)
    };
  }

  return {
    processed: false,
    ignored: true,
    event: payload.event || null
  };
}

export async function listPaymentHistory({ userId, query }) {
  const skip = (query.page - 1) * query.limit;

  const [payments, total] = await Promise.all([
    Payment.find({ user: userId }).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(query.limit),
    Payment.countDocuments({ user: userId })
  ]);

  return {
    payments: payments.map((payment) => serializePayment(payment)),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  };
}
