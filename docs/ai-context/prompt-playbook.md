# DocuMind Prompt Playbook

Use short, scoped prompts. Prefer feature IDs and compact context files over pasting long documents.

## Foundation Prompt

```text
Implement F01-F05 only.
Use centralized env validation, MongoDB connection handling, health check, AppError, global error middleware, Morgan, and Winston.
Do not add auth, document upload, AI, payments, or full UI.
Run lint, tests, and build.
```

## Review Prompt

```text
Review this branch for scope drift, missing validation, missing tests, secret leaks, and production-readiness issues.
Return blocking issues first.
```

