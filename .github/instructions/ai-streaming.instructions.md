---
applyTo: "server/**/*ai*.js,server/**/*chat*.js,client/**/*chat*.jsx,client/**/*document*.jsx"
---

# AI Streaming Instructions

- Use SSE for one-way AI response streaming.
- Keep document context and chat history bounded.
- Track per-user AI usage server-side.
- Stop generation work when the client disconnects where supported.
- Treat document text as untrusted user content.

