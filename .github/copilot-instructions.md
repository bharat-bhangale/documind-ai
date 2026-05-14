# DocuMind Copilot Instructions

DocuMind is a MERN-style AI document SaaS.

Stack:
- Client: React, Vite, Tailwind CSS, React Router, Axios.
- Server: Node.js, Express, Mongoose, MongoDB, Redis where useful.
- AI: OpenAI SDK, document summarization, SSE streaming chat.
- Payments: Razorpay order creation, signature verification, webhooks.

General rules:
- Keep work scoped to the requested feature IDs from `docs/01_FEATURES.md`.
- Prefer feature-based folders and small modules.
- Use centralized environment config instead of direct scattered `process.env` reads.
- Use `AppError` and global error middleware for API errors.
- Validate request data before business logic.
- Protect user-owned resources with authenticated ownership checks.
- Never hardcode secrets, JWT values, payment keys, API keys, prices, or deployment URLs.
- Add or update tests for changed behavior.
- Run the smallest relevant validation command before finishing.

