---
applyTo: "server/**/*.js,client/**/*.{js,jsx}"
---

# Security Instructions

- Do not log secrets, tokens, cookies, raw payment payloads, or full document text.
- Auth, payment, AI, and upload changes require negative tests.
- Enforce document ownership server-side.
- Validate and sanitize untrusted input.
- Keep production error responses generic.

