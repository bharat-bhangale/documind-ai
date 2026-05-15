# Feature Brief: F18-F23 AI Integration

Goal:
- Add OpenAI-powered document summarization, SSE document chat, chat history, AI quota tracking, token/context controls, and stream abort handling.

In scope:
- Summary endpoint for owned documents.
- SSE chat endpoint for owned documents.
- Owner-scoped chat history retrieval.
- AI provider abstraction backed by OpenAI Responses API.
- Free daily quota enforcement.
- Pro usage counting without quota limit.
- Bounded document context.
- Bounded recent chat history.
- Configured max output tokens for summary and chat.
- Abort upstream streaming when the client disconnects.

Out of scope:
- Frontend chat UI.
- Vector search or embeddings.
- AI billing dashboard.
- WebSockets.

Acceptance:
- Summary uses truncated document context and stores the result.
- SSE chat emits `ready`, `chunk`, and `done` events.
- Client disconnect aborts provider work and does not store a partial assistant message.
- Last N chat messages are sent, not full history.
- AI usage counters increment.
- Free user quota is enforced.
- Cross-user AI requests return 404 before provider calls.
- `npm run check` passes.

