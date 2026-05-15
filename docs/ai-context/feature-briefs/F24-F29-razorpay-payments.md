# Feature Brief: F24-F29 Razorpay Payments

## Scope

Implemented backend payment support for one-time DocuMind Pro upgrades:

- Razorpay order creation.
- Server-controlled plan amount and currency.
- Checkout signature verification.
- Raw-body Razorpay webhook handling.
- Idempotent webhook processing.
- User plan upgrade from Free to Pro.
- User-scoped payment history.

Frontend Razorpay Checkout.js UI remains a Phase 6 task. The backend now returns the checkout options needed by that UI.

## Endpoints

- `POST /api/payments/orders`
- `POST /api/payments/verify`
- `POST /api/payments/webhook`
- `GET /api/payments/history`

## Security Rules

- The browser never controls payment amount, currency, or plan price.
- Checkout verification uses `RAZORPAY_KEY_SECRET` and HMAC-SHA256 over `order_id|payment_id`.
- Webhook verification uses `RAZORPAY_WEBHOOK_SECRET`, `X-Razorpay-Signature`, and the raw request body.
- Webhook route is mounted before global JSON parsing.
- Duplicate webhook events are detected with `x-razorpay-event-id`.
- Payment history responses do not expose signatures, raw gateway payloads, or webhook event IDs.
- Users can verify only payment orders that belong to their account.

## Environment

Required payment variables:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `PRO_PLAN_PRICE_PAISE`
- `PRO_PLAN_CURRENCY`

## Tests

Covered cases:

- Server-controlled order amount.
- Valid checkout signature upgrades the user to Pro.
- Forged checkout signature does not upgrade the user.
- Cross-user order claim is rejected.
- Valid webhook signature upgrades captured payment orders.
- Duplicate webhook event IDs are idempotent.
- Forged webhook signatures do not upgrade users.
- Failed payment webhook does not upgrade users.
- Payment history is user-scoped and sanitized.
