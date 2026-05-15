# Feature Brief: F06-F11 Authentication

Goal:
- Add local registration/login, Google login, refresh-token rotation, protected route middleware, logout, and current-user profile.

In scope:
- User model with local and Google auth fields.
- Bcrypt password hashing.
- JWT access tokens.
- HttpOnly refresh token cookie.
- Hashed refresh token persistence.
- Refresh token rotation and reuse detection.
- `requireAuth` middleware.
- `/api/auth/register`, `/api/auth/login`, `/api/auth/google`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`.
- Tests for success and failure paths.

Out of scope:
- Document upload.
- AI chat.
- Razorpay payments.
- Frontend auth pages.

Acceptance:
- Registration creates a user with hashed password and refresh cookie.
- Login rejects invalid credentials.
- `/me` requires a valid access token.
- Refresh rotates tokens.
- Reusing an old refresh token revokes all stored tokens.
- Logout revokes active refresh token and clears the cookie.
- Google login verifies a Google ID token server-side.
- `npm run check` passes.

