# Architecture Decisions

## ADR-001: Monorepo Layout

DocuMind uses a single repository with `client/` for React and `server/` for Express. This keeps local development simple while still allowing independent deployment.

## ADR-002: Server Foundation Before Features

The first implementation phase creates configuration validation, database connection handling, health checks, logging, and centralized error handling before auth, uploads, AI, payments, or UI feature work.

## ADR-003: Express 4 For MVP Stability

The MVP pins Express to the 4.x line to match the original project tech stack and avoid framework migration risk during the initial build.

## ADR-004: AI Context Is Stored In The Repository

Copilot instructions, prompts, agents, skills, and compact AI context documents live in the repository so agent behavior is repeatable across sessions.

