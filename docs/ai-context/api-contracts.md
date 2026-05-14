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

