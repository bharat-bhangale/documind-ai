---
name: openai-sse-chat
description: Use for OpenAI summarization, document Q&A, SSE streaming, token limits, and AI quota logic.
---

# OpenAI SSE Chat

- Use SSE for one-way AI response streaming.
- Keep document context bounded.
- Include only recent relevant chat messages.
- Track per-user usage server-side.
- Abort upstream work when clients disconnect where supported.
- Do not log full document text.
- Test quota exceeded, unauthorized document, missing document, and stream setup.

