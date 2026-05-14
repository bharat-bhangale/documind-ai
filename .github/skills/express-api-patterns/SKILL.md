---
name: express-api-patterns
description: Use for DocuMind Express routes, middleware, validation, error handling, and API tests.
---

# Express API Patterns

- Keep route handlers thin.
- Use services for business logic once a feature grows.
- Use `AppError` for operational errors.
- Use global error middleware for responses.
- Validate input before database work.
- Add tests for success, validation failure, auth failure, and ownership failure.

