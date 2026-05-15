# Architecture Decisions

## ADR-001: Monorepo Layout

DocuMind uses a single repository with `client/` for React and `server/` for Express. This keeps local development simple while still allowing independent deployment.

## ADR-002: Server Foundation Before Features

The first implementation phase creates configuration validation, database connection handling, health checks, logging, and centralized error handling before auth, uploads, AI, payments, or UI feature work.

## ADR-003: Express 4 For MVP Stability

The MVP pins Express to the 4.x line to match the original project tech stack and avoid framework migration risk during the initial build.

## ADR-004: AI Context Is Stored In The Repository

Copilot instructions, prompts, agents, skills, and compact AI context documents live in the repository so agent behavior is repeatable across sessions.

## ADR-005: Refresh Token Rotation

Authentication uses short-lived JWT access tokens returned in response bodies and longer-lived refresh tokens stored only in HttpOnly cookies. The database stores SHA-256 hashes of refresh tokens, not raw refresh tokens. Every refresh request rotates the token. If a previously rotated token is reused, all stored refresh tokens for that user are revoked.

## ADR-006: Google Login Verification

Google login accepts a Google ID token from the frontend and verifies it server-side with `google-auth-library` against `GOOGLE_CLIENT_ID`. Only verified Google email payloads can create or link accounts.
