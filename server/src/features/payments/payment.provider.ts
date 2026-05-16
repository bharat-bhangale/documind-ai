import Razorpay from "razorpay";

import { config } from "../../config/env.js";
import type { PaymentGatewayOrder, PaymentGatewayOrderPayload, PaymentGatewayProvider } from "../../types/index.js";

class RazorpayPaymentProvider implements PaymentGatewayProvider {
  private client: Razorpay;

  constructor() {
    this.client = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret
    });
  }

  async createOrder(order: PaymentGatewayOrderPayload): Promise<PaymentGatewayOrder> {
    return this.client.orders.create(order) as unknown as Promise<PaymentGatewayOrder>;
  }
}

let paymentGatewayProvider: PaymentGatewayProvider = new RazorpayPaymentProvider();

export function getPaymentGatewayProvider(): PaymentGatewayProvider {
  return paymentGatewayProvider;
}

export function setPaymentGatewayProviderForTests(provider: PaymentGatewayProvider): void {
  paymentGatewayProvider = provider;
}

export function resetPaymentGatewayProviderForTests(): void {
  paymentGatewayProvider = new RazorpayPaymentProvider();
}
