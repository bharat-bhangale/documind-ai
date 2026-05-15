# DocuMind AI Context: API Contracts

This file tracks API contracts that agents should preserve unless a feature plan changes them.

## Health

### GET `/api/health`

Auth: none

Response:

```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2026-05-14T00:00:00.000Z",
  "uptime": 12.34,
  "environment": "development",
  "services": {
    "api": "up",
    "database": {
      "state": "connected",
      "readyState": 1,
      "host": "localhost",
      "name": "documind"
    }
  }
}
```

When MongoDB is not connected, `status` is `degraded` and `services.database.state` explains the connection state.

## Authentication

All auth responses use the shared error shape:

```json
{
  "success": false,
  "message": "Readable error message.",
  "statusCode": 401
}
```

Refresh tokens are stored in an HttpOnly cookie named by `REFRESH_COOKIE_NAME`. Access tokens are returned in the response body and must be sent as `Authorization: Bearer <accessToken>` for protected routes.

### POST `/api/auth/register`

Auth: none

Request:

```json
{
  "name": "Aditi Sharma",
  "email": "aditi@example.com",
  "password": "Password123"
}
```

Response: `201`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Aditi Sharma",
      "email": "aditi@example.com",
      "avatarUrl": "",
      "authProvider": "local",
      "plan": "free"
    },
    "accessToken": "jwt_access_token"
  }
}
```

### POST `/api/auth/login`

Auth: none

Request:

```json
{
  "email": "aditi@example.com",
  "password": "Password123"
}
```

Response: `200`, same shape as register.

### POST `/api/auth/google`

Auth: none

Request:

```json
{
  "credential": "google_id_token"
}
```

Behavior:
- Verifies the Google ID token against `GOOGLE_CLIENT_ID`.
- Requires a verified Google email.
- Creates a new Google user or links Google identity to an existing local email.

Response: `200`, same shape as login.

### POST `/api/auth/refresh`

Auth: HttpOnly refresh cookie

Behavior:
- Verifies refresh JWT.
- Requires a matching hashed refresh token in the database.
- Rotates refresh token on every use.
- Revokes all stored refresh tokens if reuse is detected.

Response: `200`, same shape as login.

### POST `/api/auth/logout`

Auth: optional refresh cookie

Behavior:
- Removes the active refresh token if present.
- Clears the refresh cookie.

Response:

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

### GET `/api/auth/me`

Auth: Bearer access token

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Aditi Sharma",
      "email": "aditi@example.com",
      "avatarUrl": "",
      "authProvider": "local",
      "plan": "free"
    }
  }
}
```

## Documents

All document routes require `Authorization: Bearer <accessToken>`.

Plan limits:
- Free users: `FREE_PLAN_MAX_DOCUMENTS` documents and `FREE_PLAN_MAX_FILE_SIZE_BYTES` per PDF.
- Pro users: unlimited documents and `PRO_PLAN_MAX_FILE_SIZE_BYTES` per PDF.

Uploaded PDFs are temporary ingestion files. The server extracts text with `pdf-parse`, stores metadata and extracted text in MongoDB, and removes the temporary uploaded file after success or failure.

### POST `/api/documents/upload`

Auth: Bearer access token

Content type: `multipart/form-data`

Fields:
- `file`: required PDF file.
- `title`: optional document title.

Response: `201`

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "document_id",
      "title": "Project Brief",
      "originalName": "brief.pdf",
      "mimeType": "application/pdf",
      "fileSize": 12345,
      "pageCount": 2,
      "textLength": 2048,
      "status": "ready",
      "extractedText": "Extracted PDF text...",
      "createdAt": "2026-05-15T00:00:00.000Z",
      "updatedAt": "2026-05-15T00:00:00.000Z"
    }
  }
}
```

### GET `/api/documents`

Auth: Bearer access token

Query:
- `page`: default `1`.
- `limit`: default `10`, max `50`.
- `sortBy`: `createdAt`, `updatedAt`, `title`, or `fileSize`.
- `sortOrder`: `asc` or `desc`.

Response:

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "document_id",
        "title": "Project Brief",
        "originalName": "brief.pdf",
        "mimeType": "application/pdf",
        "fileSize": 12345,
        "pageCount": 2,
        "textLength": 2048,
        "status": "ready"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

List responses intentionally omit `extractedText`.

### GET `/api/documents/:documentId`

Auth: Bearer access token

Ownership: only the owner can read the document.

Response: same document shape as upload, including `extractedText`.

### PATCH `/api/documents/:documentId`

Auth: Bearer access token

Ownership: only the owner can update the document.

Request:

```json
{
  "title": "Updated Project Brief"
}
```

Response: updated document, including `extractedText`.

### DELETE `/api/documents/:documentId`

Auth: Bearer access token

Ownership: only the owner can delete the document.

Response:

```json
{
  "success": true,
  "message": "Document deleted successfully."
}
```

## AI

All AI routes require `Authorization: Bearer <accessToken>` and enforce document ownership before calling the AI provider.

Cost and context controls:
- Free users are limited by `AI_FREE_DAILY_QUOTA`.
- Pro users are not quota-limited but usage is still counted.
- Document context is truncated to `AI_MAX_DOCUMENT_CHARS`.
- Chat history is limited to `AI_MAX_CHAT_HISTORY_MESSAGES` previous messages.
- Summary output is capped by `AI_SUMMARY_MAX_OUTPUT_TOKENS`.
- Chat output is capped by `AI_CHAT_MAX_OUTPUT_TOKENS`.

### POST `/api/ai/documents/:documentId/summary`

Auth: Bearer access token

Behavior:
- Validates the document belongs to the authenticated user.
- Consumes one AI usage unit.
- Sends bounded document context to OpenAI.
- Saves the generated summary on the document.

Response:

```json
{
  "success": true,
  "data": {
    "summary": "Concise document summary.",
    "document": {
      "id": "document_id",
      "title": "Project Brief",
      "summary": "Concise document summary.",
      "summaryGeneratedAt": "2026-05-15T00:00:00.000Z"
    },
    "usage": {
      "dailyCount": 1,
      "dailyLimit": 10,
      "remaining": 9
    },
    "context": {
      "documentCharactersSent": 8000,
      "documentTruncated": true,
      "estimatedInputTokens": 2000,
      "maxOutputTokens": 600
    }
  }
}
```

### POST `/api/ai/documents/:documentId/chat`

Auth: Bearer access token

Content type: `application/json`

Request:

```json
{
  "message": "What are the key points?"
}
```

Response type: `text/event-stream`

Events:
- `ready`: stream metadata, quota snapshot, and context limits.
- `chunk`: one streamed text chunk.
- `done`: final assistant message and usage/context metadata.
- `error`: stream failure after SSE headers have been sent.

Example stream:

```text
event: ready
data: {"usage":{"dailyCount":2,"dailyLimit":10,"remaining":8}}

event: chunk
data: {"chunk":"The document"}

event: chunk
data: {"chunk":" explains..."}

event: done
data: {"aborted":false,"assistantMessage":{"role":"assistant","content":"The document explains..."}}
```

Behavior:
- Uses SSE over HTTP, not WebSockets.
- Saves the user message before streaming.
- Saves the assistant message only after the stream completes.
- Aborts upstream AI work when the client disconnects.

### GET `/api/ai/documents/:documentId/messages`

Auth: Bearer access token

Query:
- `page`: default `1`.
- `limit`: default `20`, max `50`.

Response:

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message_id",
        "role": "user",
        "content": "What are the key points?",
        "estimatedTokens": 6,
        "createdAt": "2026-05-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```
