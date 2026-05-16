import crypto from "node:crypto";

function toBuffer(value: string | Buffer): Buffer {
  if (Buffer.isBuffer(value)) {
    return value;
  }

  return Buffer.from(String(value ?? ""), "utf8");
}

function hmacSha256(payload: string | Buffer, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function timingSafeStringEqual(receivedValue: string | Buffer, expectedValue: string | Buffer): boolean {
  const received = toBuffer(receivedValue);
  const expected = toBuffer(expectedValue);

  if (received.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(received, expected);
}

export function createCheckoutSignature({ orderId, paymentId, secret }: { orderId: string; paymentId: string; secret: string }): string {
  return hmacSha256(`${orderId}|${paymentId}`, secret);
}

export function isValidCheckoutSignature({ orderId, paymentId, signature, secret }: { orderId: string; paymentId: string; signature: string; secret: string }): boolean {
  const expectedSignature = createCheckoutSignature({ orderId, paymentId, secret });
  return timingSafeStringEqual(signature, expectedSignature);
}

export function createWebhookSignature({ rawBody, secret }: { rawBody: string | Buffer; secret: string }): string {
  return hmacSha256(toBuffer(rawBody), secret);
}

export function isValidWebhookSignature({ rawBody, signature, secret }: { rawBody: string | Buffer; signature: string; secret: string }): boolean {
  const expectedSignature = createWebhookSignature({ rawBody, secret });
  return timingSafeStringEqual(signature, expectedSignature);
}
