export function serializePayment(payment) {
  return {
    id: payment.id,
    plan: payment.plan,
    provider: payment.provider,
    orderId: payment.razorpayOrderId,
    paymentId: payment.razorpayPaymentId || null,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    receipt: payment.receipt,
    paidAt: payment.paidAt || null,
    failedAt: payment.failedAt || null,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt
  };
}
