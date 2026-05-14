---
applyTo: "server/**/*payment*.js,server/**/*razorpay*.js,server/**/*webhook*.js,client/**/*payment*.jsx,client/**/*pricing*.jsx"
---

# Payment Instructions

- Payment amount and plan mapping must be decided server-side.
- Razorpay signatures must be verified before plan upgrades.
- Webhook handlers must be idempotent.
- Use raw request body where Razorpay webhook verification requires it.
- Use test keys only during local development.

