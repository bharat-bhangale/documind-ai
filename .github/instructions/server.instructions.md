---
applyTo: "server/**/*.js"
---

# Server Instructions

- Use Express middleware consistently.
- Keep route handlers thin; place reusable logic in services.
- Use centralized config from `server/src/config/env.js`.
- Use `AppError` for operational errors.
- Do not expose stack traces in production responses.
- Add tests for success and failure paths.

