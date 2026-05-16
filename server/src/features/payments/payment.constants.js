export const PAYMENT_PLAN = Object.freeze({
  PRO: "pro"
});

export const PAYMENT_PROVIDER = Object.freeze({
  RAZORPAY: "razorpay"
});

export const PAYMENT_STATUS = Object.freeze({
  CREATED: "created",
  PAID: "paid",
  FAILED: "failed"
});

export const PAYMENT_SOURCE = Object.freeze({
  CHECKOUT: "checkout",
  WEBHOOK: "webhook"
});

export const RAZORPAY_WEBHOOK_EVENT = Object.freeze({
  PAYMENT_CAPTURED: "payment.captured",
  PAYMENT_FAILED: "payment.failed"
});
