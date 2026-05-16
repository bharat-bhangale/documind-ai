import Razorpay from "razorpay";

import { config } from "../../config/env.js";

class RazorpayPaymentProvider {
  constructor() {
    this.client = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret
    });
  }

  async createOrder(order) {
    return this.client.orders.create(order);
  }
}

let paymentGatewayProvider = new RazorpayPaymentProvider();

export function getPaymentGatewayProvider() {
  return paymentGatewayProvider;
}

export function setPaymentGatewayProviderForTests(provider) {
  paymentGatewayProvider = provider;
}

export function resetPaymentGatewayProviderForTests() {
  paymentGatewayProvider = new RazorpayPaymentProvider();
}
