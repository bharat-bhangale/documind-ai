# DocuMind AI Context: Architecture Decisions

This file tracks decisions that future AI sessions should treat as source-of-truth context.

## Current Decisions

- Use a monorepo with `client/` and `server/`.
- Build in feature order from `docs/01_FEATURES.md`.
- Keep the first implementation milestone limited to F01-F05.
- Use Express 4.21.x for the MVP server.
- Use ESM JavaScript for both client and server.
- Validate environment variables at server startup.
- Keep direct `process.env` reads inside config modules only.
- Use AppError plus global Express error middleware.
- Use Server-Sent Events for future AI streaming chat.
- Use Razorpay test mode until production deployment is intentionally configured.

