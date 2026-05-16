import type { PaymentPlan, PaymentProvider, PaymentSource, PaymentStatus } from "../../types/index.js";

export const PAYMENT_PLAN: Record<string, PaymentPlan> = Object.freeze({
  PRO: "pro"
});

export const PAYMENT_PROVIDER: Record<string, PaymentProvider> = Object.freeze({
  RAZORPAY: "razorpay"
});

export const PAYMENT_STATUS: Record<string, PaymentStatus> = Object.freeze({
  CREATED: "created",
  PAID: "paid",
  FAILED: "failed"
});

export const PAYMENT_SOURCE: Record<string, PaymentSource> = Object.freeze({
  CHECKOUT: "checkout",
  WEBHOOK: "webhook"
});

export const RAZORPAY_WEBHOOK_EVENT = Object.freeze({
  PAYMENT_CAPTURED: "payment.captured",
  PAYMENT_FAILED: "payment.failed"
});
