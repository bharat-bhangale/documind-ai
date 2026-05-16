import crypto from "node:crypto";

function toBuffer(value) {
  if (Buffer.isBuffer(value)) {
    return value;
  }

  return Buffer.from(String(value ?? ""), "utf8");
}

function hmacSha256(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function timingSafeStringEqual(receivedValue, expectedValue) {
  const received = toBuffer(receivedValue);
  const expected = toBuffer(expectedValue);

  if (received.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(received, expected);
}

export function createCheckoutSignature({ orderId, paymentId, secret }) {
  return hmacSha256(`${orderId}|${paymentId}`, secret);
}

export function isValidCheckoutSignature({ orderId, paymentId, signature, secret }) {
  const expectedSignature = createCheckoutSignature({ orderId, paymentId, secret });
  return timingSafeStringEqual(signature, expectedSignature);
}

export function createWebhookSignature({ rawBody, secret }) {
  return hmacSha256(toBuffer(rawBody), secret);
}

export function isValidWebhookSignature({ rawBody, signature, secret }) {
  const expectedSignature = createWebhookSignature({ rawBody, secret });
  return timingSafeStringEqual(signature, expectedSignature);
}
