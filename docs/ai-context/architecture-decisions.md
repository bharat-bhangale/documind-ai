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
- Use JWT access tokens in response bodies and refresh tokens in HttpOnly cookies.
- Store only SHA-256 hashes of refresh tokens in MongoDB.
- Rotate refresh tokens on every refresh request and revoke all stored refresh tokens when reuse is detected.
- Support Google login by verifying Google ID tokens server-side against `GOOGLE_CLIENT_ID`.
- Store extracted PDF text and document metadata in MongoDB after upload.
- Treat uploaded PDF files as temporary ingestion artifacts and delete them after extraction succeeds or fails.
- Enforce Free and Pro document upload limits server-side.
- Use the OpenAI Responses API through a provider abstraction so production calls use the official SDK and tests use deterministic mocks.
- Stream document chat over SSE, with `ready`, `chunk`, `done`, and `error` events.
- Count AI usage server-side before model calls to prevent quota bypass and cost abuse.
- Store chat history as owner-scoped `ChatMessage` records and send only the latest configured messages to the model.
- Use Server-Sent Events for AI streaming chat.
- Use Razorpay test mode until production deployment is intentionally configured.
