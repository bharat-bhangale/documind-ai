# DocuMind AI Coding Workflow Report

> Version: 1.0  
> Created: May 11, 2026  
> Purpose: AI-assisted development operating plan for building DocuMind with GitHub Copilot as the primary system and Google Antigravity as a complementary agent-first IDE.

---

## 1. Executive Summary

DocuMind is a full-stack AI document application with a React/Vite/Tailwind frontend, an Express/Mongoose backend, MongoDB Atlas, OpenAI-powered summarization and streaming chat, Razorpay payments, security hardening, Docker, GitHub Actions, and deployment to Vercel plus Render or Railway.

The fastest safe path to production is not "ask one AI to build everything." The right path is to turn the repository into an AI-ready development environment:

1. Give Copilot stable project context through repository instructions, path-specific instructions, prompt files, skills, and curated docs.
2. Split work by DocuMind feature phase and assign bounded tasks to specialized Copilot agents.
3. Use hooks and CI gates to prevent unsafe commands, secret leaks, missing tests, broken builds, and unreviewed high-risk changes.
4. Use Copilot Memory and compact context packs to reduce repeated prompting and token waste.
5. Use Google Antigravity for asynchronous multi-surface verification, especially UI iteration, browser-based testing, screenshots, walkthroughs, and long-running maintenance tasks.

The expected result is a repeatable AI development system that improves delivery speed while keeping the codebase maintainable, secure, and production-oriented.

---

## 2. Research Basis

This report is grounded in:

- Local DocuMind project docs:
  - `docs/01_FEATURES.md`: 52 features across foundation, auth, document management, AI integration, Razorpay payments, frontend UI, security, and DevOps.
  - `docs/02_TECH_STACK.md`: React 19, Vite, Tailwind, React Router, Express 4, Mongoose, MongoDB Atlas, Redis, OpenAI SDK, Razorpay, Docker, GitHub Actions, Vercel, Render/Railway.
- GitHub Copilot primary documentation:
  - [Repository custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions) for `.github/copilot-instructions.md`, `.github/instructions/**/*.instructions.md`, and agent instructions.
  - [Custom agents](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents) for `.github/agents/*.agent.md` profiles with tools, prompts, and MCP configuration.
  - [Agent skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills) for reusable `SKILL.md` folders that Copilot loads only when relevant.
  - [Hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks) for session, prompt, tool-use, and error automation in `.github/hooks/*.json`.
  - [MCP for cloud agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/extend-cloud-agent-with-mcp) for external tools and data sources.
  - [Copilot code review](https://docs.github.com/en/copilot/concepts/agents/code-review) for PR review, full project context gathering, and GitHub Actions-backed agentic review.
  - [Copilot CLI context management](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/context-management) for `/context`, `/compact`, and automatic compaction in long sessions.
  - [Copilot Memory](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-memory) for repository-level learned context used by cloud agent, code review, and CLI.
- Google Antigravity primary documentation:
  - [Google Developers Blog: Build with Google Antigravity](https://developers.googleblog.com/en/build-with-google-antigravity-our-new-agentic-development-platform/), which describes Antigravity as an agentic development platform where agents can plan, execute, and verify work across editor, terminal, and browser, with a Manager Surface, artifacts, screenshots, walkthroughs, browser recordings, and a knowledge base.

Important caveat: Several Copilot capabilities are public preview or plan-dependent. Treat prompt files, skills, hooks, Memory, some cloud-agent behavior, and Antigravity public-preview behavior as evolving surfaces. Keep this report updated as tool behavior changes.

---

## 3. Target AI Development Architecture

DocuMind should use an "AI Development Operating System" layered around the codebase.

```text
Human product intent
  -> DocuMind feature docs and tech stack docs
  -> AI context files and architecture decisions
  -> Copilot instructions, prompts, agents, skills, hooks, MCP
  -> Feature branches and bounded PRs
  -> CI, security, tests, Copilot code review, human review
  -> Production deployment and monitoring
```

The main idea is separation of responsibility:

- **Global instructions** define stable repo-wide conventions.
- **Path-specific instructions** define local rules for `server`, `client`, security, payments, and AI streaming.
- **Prompt files** turn repeated tasks into reusable commands.
- **Custom agents** encode roles and ownership boundaries.
- **Skills** hold deeper procedures, examples, and scripts that should not be injected into every prompt.
- **Hooks** enforce safety and auditability while agents work.
- **MCP** connects only the external tools that materially improve output.
- **Copilot Memory** stores useful learned patterns, while committed context files remain the source of truth.
- **Antigravity** handles asynchronous, artifact-rich, browser-terminal-editor validation loops.

---

## 4. Recommended Repository AI Structure

Add this structure before heavy implementation. It keeps AI behavior consistent and reduces token waste.

```text
.github/
  copilot-instructions.md
  instructions/
    server.instructions.md
    client.instructions.md
    security.instructions.md
    payments.instructions.md
    ai-streaming.instructions.md
  prompts/
    feature-plan.prompt.md
    api-endpoint.prompt.md
    react-component.prompt.md
    test-generation.prompt.md
    pr-review.prompt.md
    production-readiness.prompt.md
  agents/
    backend-api.agent.md
    frontend-ui.agent.md
    ai-integration.agent.md
    payments.agent.md
    security-review.agent.md
    devops-ci.agent.md
    documentation.agent.md
  skills/
    express-api-patterns/SKILL.md
    react-dashboard-ui/SKILL.md
    pdf-ingestion/SKILL.md
    openai-sse-chat/SKILL.md
    razorpay-payments/SKILL.md
    production-security/SKILL.md
    docker-deployment/SKILL.md
  hooks/
    copilot-policy.json
    scripts/
      session-banner.ps1
      pre-tool-policy.ps1
      post-tool-audit.ps1
docs/
  ai-context/
    feature-briefs/
    architecture-decisions.md
    api-contracts.md
    prompt-playbook.md
```

Do not put every rule in `.github/copilot-instructions.md`. Keep it short. Put deeper details in path instructions, skills, and docs context packs.

---

## 5. Copilot Capability Map For DocuMind

| Capability | Best Use In DocuMind | Why It Helps |
|---|---|---|
| Inline completions | Small edits, React JSX, Express middleware, schema fields | Fast local coding without leaving the file |
| Copilot Chat | Explaining code, exploring errors, drafting tests, local refactors | Good for interactive developer-led work |
| Agent mode in IDE | Scoped edits across a few files | Useful for feature slices like one endpoint plus tests |
| Copilot cloud agent | Background implementation on branches and issues | Good for isolated tasks, docs, test coverage, bug fixes |
| Copilot CLI | Terminal-first tasks, local automation, repo investigation | Useful for scripted workflows and quick repo operations |
| Code review | PR feedback, missed edge cases, security concerns | Adds an AI review layer before human approval |
| Prompt files | Reusable task instructions | Reduces repeated prompt writing and improves consistency |
| Custom instructions | Repo and path-specific conventions | Prevents repeated context setup |
| Custom agents | Role-based task execution | Keeps backend, frontend, security, payments, and DevOps work scoped |
| Skills | Repeatable deep workflows | Loads detailed guidance only when relevant |
| Hooks | Safety, audit, policy enforcement | Blocks dangerous commands and logs tool usage |
| MCP | GitHub, Playwright, docs, deployment context | Adds external context and browser verification without manual copying |
| Copilot Memory | Learned repository patterns | Reduces repeated explanations over time |

---

## 6. DocuMind Phase-by-Phase AI Workflow

### Phase 1: Foundation (F01-F05)

Scope:
- Monorepo setup with `client/` and `server/`.
- Environment validation.
- MongoDB connection and health check.
- Central error handling.
- Morgan and Winston logging.

Primary Copilot workflow:
- Use `feature-plan.prompt.md` first to generate the implementation checklist.
- Use `backend-api.agent.md` for Express setup.
- Use `devops-ci.agent.md` for package scripts and base CI alignment.

Skills:
- `express-api-patterns`
- `production-security`

Validation:
- `npm install` in both apps.
- Server starts without missing environment variables when `.env` is complete.
- Missing required environment variables fail fast.
- `/api/health` reports uptime and database status.
- Lint passes.

Acceptance prompt:

```text
Use the backend-api agent and express-api-patterns skill.
Implement DocuMind F01-F05 only.
Do not add auth, upload, AI, or payment code yet.
Return the changed files, startup command, health endpoint response shape, and validation commands.
```

### Phase 2: Authentication (F06-F11)

Scope:
- Register, login, refresh-token rotation, protected routes, logout, current profile.
- HttpOnly refresh token cookie.
- Access token verification middleware.
- Bcrypt password hashing.
- Login with Google

Primary Copilot workflow:
- Use `api-endpoint.prompt.md` to generate endpoint contracts before code.
- Use `backend-api.agent.md` for implementation.
- Use `security-review.agent.md` after implementation.

Skills:
- `express-api-patterns`
- `production-security`

Validation:
- Unit tests for password hashing behavior, token issue, refresh rotation, logout, and invalid token paths.
- Integration tests for auth endpoints.
- Verify cookies are HttpOnly, Secure in production, SameSite configured, and not accessible to client JavaScript.
- Verify token reuse detection revokes compromised refresh tokens.

Acceptance prompt:

```text
Implement F06-F11 auth only.
Use JWT access tokens, refresh token rotation, HttpOnly refresh cookies, bcryptjs, and centralized AppError handling.
Add tests for register, login, refresh, logout, and /me.
Do not implement document upload yet.
```

### Phase 3: Document Management (F12-F17)

Scope:
- PDF upload with Multer.
- MIME and file-size validation.
- Text extraction with `pdf-parse`.
- Document CRUD, ownership checks, pagination.
- Free vs Pro upload limits.

Primary Copilot workflow:
- Use `pdf-ingestion` skill.
- Use `backend-api.agent.md` for server changes.
- Use `security-review.agent.md` for IDOR and upload validation.

Skills:
- `pdf-ingestion`
- `express-api-patterns`
- `production-security`

Validation:
- Upload accepts valid digital PDFs and rejects non-PDF files.
- Free users are limited to 3 documents and smaller files.
- Users cannot fetch, update, delete, summarize, or chat with another user's document.
- Pagination handles empty and large document sets.
- Temporary uploaded files are cleaned up if extraction fails.

Acceptance prompt:

```text
Implement F12-F17.
Focus on secure PDF upload, extraction, metadata persistence, ownership validation, and pagination.
Include tests for invalid MIME type, file too large, free-plan limit, and cross-user access denial.
```

### Phase 4: AI Integration (F18-F23)

Scope:
- OpenAI-powered summary.
- Streaming chat with document via SSE.
- Chat history.
- User quota tracking.
- Token/cost controls.
- Abort stream on client disconnect.

Primary Copilot workflow:
- Use `ai-integration.agent.md`.
- Use `openai-sse-chat` skill.
- Use `security-review.agent.md` for prompt injection, quota bypass, and data isolation.
- Use Antigravity for browser verification of streaming chat UI once frontend exists.

Skills:
- `openai-sse-chat`
- `production-security`

Validation:
- Summary works on a truncated document context.
- SSE streams chunks and closes cleanly.
- Client disconnect aborts upstream work where supported.
- Last N chat messages are included, not full unbounded history.
- AI usage counters increment consistently.
- Free user quota enforcement is tested.
- AI responses never include another user's document content.

Acceptance prompt:

```text
Implement F18-F23 only.
Use SSE for unidirectional streaming, keep context bounded, track usage, and add tests for quota limits and client disconnect behavior.
Do not use WebSockets.
```

### Phase 5: Razorpay Payments (F24-F29)

Scope:
- Razorpay order creation.
- Checkout integration.
- Signature verification.
- Webhook handler using raw body.
- Plan upgrade and payment history.

Primary Copilot workflow:
- Use `payments.agent.md`.
- Use `razorpay-payments` skill.
- Use `security-review.agent.md` before merge.

Skills:
- `razorpay-payments`
- `production-security`

Validation:
- Order amount is server-controlled, not trusted from client.
- Payment verification uses HMAC signature comparison.
- Webhook uses raw body and verifies Razorpay signature.
- Webhook processing is idempotent.
- Failed or forged payment does not upgrade the user.
- Payment history hides sensitive raw gateway data from users.

Acceptance prompt:

```text
Implement F24-F29.
Keep all payment amounts server-side, verify signatures, make webhook processing idempotent, and add tests for forged signatures and duplicate webhook events.
```

### Phase 6: Frontend UI (F30-F40)

Scope:
- Landing page.
- Login and registration.
- Dashboard and document list.
- Upload component.
- Document viewer and AI chat.
- Streaming chat UI.
- Pricing and checkout.
- Protected routes, toasts, loading states, responsive design.

Primary Copilot workflow:
- Use `frontend-ui.agent.md`.
- Use `react-component.prompt.md`.
- Use Antigravity for browser verification, screenshots, and walkthrough artifacts.

Skills:
- `react-dashboard-ui`
- `openai-sse-chat`
- `razorpay-payments`

Validation:
- Frontend builds with Vite.
- Routes redirect correctly based on auth state.
- Upload, dashboard, document viewer, chat, and pricing flows work in browser.
- Streaming chat appends chunks without layout shift.
- UI works on mobile and desktop.
- Payment modal loads only when needed.

Acceptance prompt:

```text
Build F30-F40.
Use existing backend API contracts.
Implement protected routes, auth forms, dashboard, upload, document viewer, streaming chat, pricing, and responsive states.
Run browser checks and provide screenshots for dashboard, document viewer, and pricing.
```

### Phase 7: Security And Production Hardening (F41-F45)

Scope:
- Rate limiting.
- Validation with Joi or Zod.
- CORS.
- Helmet.
- XSS and NoSQL injection prevention.

Primary Copilot workflow:
- Use `security-review.agent.md`.
- Use `production-security` skill.
- Use Copilot code review after implementation.

Skills:
- `production-security`

Validation:
- Login has stricter rate limits than general API routes.
- CORS only allows configured frontend origins.
- Validation blocks malformed payloads.
- Mongo query operators are sanitized.
- Security headers exist in production.
- Sensitive errors are not leaked.

Acceptance prompt:

```text
Audit and implement F41-F45.
Focus on practical Express hardening for auth, upload, AI, and payment routes.
Add tests where a security failure can be reproduced locally.
```

### Phase 8: DevOps And Deployment (F46-F52)

Scope:
- Backend Dockerfile.
- Frontend multi-stage Dockerfile.
- Docker Compose.
- GitHub Actions CI.
- Production deployment.
- README and DECISIONS.

Primary Copilot workflow:
- Use `devops-ci.agent.md`.
- Use `docker-deployment` skill.
- Use `documentation.agent.md` for README and DECISIONS.

Skills:
- `docker-deployment`
- `production-security`

Validation:
- Docker images build.
- Compose starts MongoDB/Redis/backend/frontend or references managed services clearly.
- GitHub Actions runs lint, tests, build, and Docker build.
- Deployment docs list all environment variables.
- README includes setup, scripts, API overview, screenshots, and deployment instructions.

Acceptance prompt:

```text
Implement F46-F52.
Create Dockerfiles, compose, GitHub Actions CI, README, and DECISIONS.
Include exact local and production environment setup steps.
Run or explain every validation command.
```

---

## 7. Custom Instructions Strategy

### Repository-Wide Instructions

Use `.github/copilot-instructions.md` for rules that apply to nearly every task.

Recommended content:

```md
# DocuMind Copilot Instructions

DocuMind is a MERN-style AI document SaaS:
- Client: React, Vite, Tailwind, React Router, Axios.
- Server: Node.js, Express, Mongoose, MongoDB, Redis where useful.
- AI: OpenAI SDK, document summarization, SSE streaming chat.
- Payments: Razorpay order creation, signature verification, webhooks.

General rules:
- Keep work scoped to the requested feature IDs from docs/01_FEATURES.md.
- Prefer feature-based folders over large MVC files.
- Use centralized config, AppError, validation, and logging.
- Never scatter process.env usage outside config.
- Add or update tests for changed behavior.
- Do not hardcode secrets, prices, JWT settings, OpenAI keys, Razorpay keys, or deployment URLs.
- Before finishing, run the smallest relevant validation command and report results.
```

Keep this under control. It should not become a full architecture document.

### Path-Specific Instructions

Use `.github/instructions/*.instructions.md` for local rules.

Recommended files:

```md
---
applyTo: "server/**/*.js,server/**/*.ts"
---
Use Express middleware consistently.
Route handlers must use async error forwarding.
Use centralized env config and AppError.
Protect user-owned resources with req.user.id checks.
```

```md
---
applyTo: "client/**/*.jsx,client/**/*.tsx,client/**/*.js,client/**/*.ts"
---
Use React functional components.
Keep API calls in service modules.
Use Tailwind utility classes consistently.
Handle loading, empty, error, and success states.
Do not store refresh tokens in localStorage.
```

```md
---
applyTo: "server/**/payment*,server/**/webhook*,server/**/razorpay*"
---
Payment amount must be decided server-side.
Razorpay signatures must be verified before any plan upgrade.
Webhook handlers must be idempotent and use raw request body where required.
```

### Agent Instructions

Use `AGENTS.md` only if you want a local directory-specific instruction hierarchy. For DocuMind, `.github/agents/*.agent.md` is a cleaner first step because it creates named specialists.

---

## 8. Prompt Files

Prompt files should live in `.github/prompts/*.prompt.md`. They are reusable instructions for repeated tasks. They reduce prompt length, prevent missed acceptance criteria, and make work more consistent.

### Recommended Prompt Files

| Prompt File | Use |
|---|---|
| `feature-plan.prompt.md` | Convert feature IDs into a bounded implementation plan |
| `api-endpoint.prompt.md` | Design Express route contracts before implementation |
| `react-component.prompt.md` | Generate React pages/components with states and API integration |
| `test-generation.prompt.md` | Generate focused tests for changed behavior |
| `pr-review.prompt.md` | Self-review a branch before opening a PR |
| `production-readiness.prompt.md` | Check deployment, security, config, observability, and docs |

### Example: `api-endpoint.prompt.md`

```md
---
agent: "agent"
description: "Design or implement a DocuMind backend API endpoint"
---

You are working in DocuMind.

Feature IDs: ${input:featureIds:Example F06-F11}
Endpoint goal: ${input:goal:Describe the endpoint or route group}

Use these sources:
- #file:../../docs/01_FEATURES.md
- #file:../../docs/02_TECH_STACK.md

Before editing code, produce:
1. Route list with method, path, auth requirement, request body, response body.
2. Data model changes, if any.
3. Validation rules.
4. Security checks.
5. Tests to add.

Then implement only the approved scope.
Do not add unrelated features.
```

### Example: `production-readiness.prompt.md`

```md
---
agent: "agent"
description: "Run a production-readiness review for a DocuMind feature branch"
---

Review this branch for production readiness.

Check:
- Environment variable validation
- Auth and ownership checks
- Input validation
- Rate limits
- Logging and error handling
- AI token/cost controls
- Payment signature and webhook safety
- Docker and CI compatibility
- Tests and documentation

Return:
1. Blocking issues
2. Non-blocking improvements
3. Exact commands run
4. Merge readiness decision
```

---

## 9. Custom Agent Orchestration

Custom agents should be specialized enough to reduce context noise but broad enough to complete useful work.

### Recommended Agents

| Agent | Ownership | Best Tasks | Avoid |
|---|---|---|---|
| `backend-api.agent.md` | Express routes, models, services, middleware, tests | Auth, documents, health, quotas | UI styling |
| `frontend-ui.agent.md` | React pages, components, routes, services | Dashboard, upload, viewer, chat UI | Payment verification logic |
| `ai-integration.agent.md` | OpenAI, summarization, SSE, token limits | AI chat, summary, usage tracking | Razorpay |
| `payments.agent.md` | Razorpay order, verification, webhooks | Payment flow, plan upgrade | General auth redesign |
| `security-review.agent.md` | Threat modeling, validation, tests | Auth, upload, AI, payment review | Cosmetic UI |
| `devops-ci.agent.md` | Docker, GitHub Actions, deployment | CI, Dockerfiles, compose | Product copy |
| `documentation.agent.md` | README, DECISIONS, API docs | Setup docs, architecture rationale | App logic |

### Example: `backend-api.agent.md`

```md
---
name: backend-api
description: Implements and reviews DocuMind Express/Mongoose backend features.
tools: ["read", "edit", "search", "bash", "github/*"]
---

You are the backend API specialist for DocuMind.

Scope:
- server application only
- Express routes, middleware, controllers, services, models, validation, tests
- MongoDB/Mongoose patterns
- auth, documents, AI usage accounting, and API error handling

Rules:
- Keep changes scoped to requested feature IDs.
- Use centralized config for environment variables.
- Use AppError and global error middleware.
- Validate request bodies before business logic.
- Enforce req.user ownership on document and chat resources.
- Add tests for success and failure paths.
- Report validation commands and results before finishing.

Do not:
- Change frontend UI unless explicitly requested.
- Hardcode secrets or production URLs.
- Add payment logic unless the task includes F24-F29.
```

### Orchestration Pattern

Use one owner per feature branch:

1. Planner uses `feature-plan.prompt.md`.
2. Implementer agent owns the feature.
3. Security agent reviews high-risk surfaces.
4. Test prompt generates missing tests.
5. Copilot code review reviews PR.
6. Human reviewer approves final merge.

Do not run multiple agents against the same files unless their ownership is disjoint. For example:

- Safe parallel work: `frontend-ui` builds dashboard while `backend-api` implements document list endpoint.
- Risky parallel work: two agents both editing auth middleware and Axios interceptors.

---

## 10. Skills Strategy

Skills are deeper playbooks that Copilot loads only when relevant. Use them for repeatable procedures that are too detailed for global instructions.

### Recommended Skills

| Skill | Contents |
|---|---|
| `express-api-patterns` | Controller/service/model structure, AppError usage, validation, pagination, test patterns |
| `react-dashboard-ui` | React page/component conventions, loading/error/empty states, Tailwind layout, accessibility |
| `pdf-ingestion` | Multer setup, MIME checks, size limits, extraction failures, cleanup, document ownership |
| `openai-sse-chat` | SSE headers, streaming lifecycle, bounded context, abort handling, token accounting |
| `razorpay-payments` | Order creation, signature verification, raw-body webhooks, idempotency, plan upgrade |
| `production-security` | Auth, CORS, Helmet, rate limit, NoSQL injection, XSS, secrets, logging |
| `docker-deployment` | Dockerfiles, compose, environment variables, CI, deployment runbooks |

### Example: `openai-sse-chat/SKILL.md`

```md
---
name: openai-sse-chat
description: Use for DocuMind OpenAI summarization, document Q&A, SSE streaming, token limits, and AI quota logic.
---

When implementing AI features:
- Keep document context bounded.
- Include only the latest relevant chat messages.
- Track per-user usage before and after successful AI requests.
- Use SSE for server-to-client token streaming.
- Set headers for event streams and flush early where supported.
- Stop streaming when the client disconnects.
- Never stream another user's document content.
- Add tests for quota exceeded, missing document, unauthorized document, and stream setup.
```

Do not pre-approve shell execution in skills unless the script is reviewed and tightly scoped. Skills can contain scripts, but any script that touches files, secrets, payments, or deployment needs human review.

---

## 11. Hooks And Safety Automation

Hooks are the guardrails around autonomous execution. For DocuMind, start with policy, audit, and secret-protection hooks.

### Recommended Hook Events

| Hook | Use |
|---|---|
| `sessionStart` | Display project policy and trusted-directory warning |
| `userPromptSubmitted` | Log prompt metadata locally for audit, with secret redaction |
| `preToolUse` | Block destructive commands and unsafe secret access |
| `postToolUse` | Log command outcomes and failed validations |
| `errorOccurred` | Record agent/tool errors for follow-up |
| `sessionEnd` | Summarize changed files and validation status |

### Example: `.github/hooks/copilot-policy.json`

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "powershell": "./scripts/session-banner.ps1",
        "cwd": ".github/hooks",
        "timeoutSec": 10
      }
    ],
    "preToolUse": [
      {
        "type": "command",
        "powershell": "./scripts/pre-tool-policy.ps1",
        "cwd": ".github/hooks",
        "timeoutSec": 15
      }
    ],
    "postToolUse": [
      {
        "type": "command",
        "powershell": "./scripts/post-tool-audit.ps1",
        "cwd": ".github/hooks",
        "timeoutSec": 10
      }
    ]
  }
}
```

### Commands To Block Or Require Manual Review

Block:

- Recursive deletion outside repo workspace.
- Disk formatting or system-level deletion.
- Secret file reads such as `.env`, private keys, credential stores, and cloud config.
- `curl | bash`, `wget | sh`, and PowerShell `Invoke-Expression` download-execute patterns.
- Force pushes to protected branches.
- Commands that print environment variables in full.

Require manual review:

- `git push`
- production deployment commands
- package major version upgrades
- database migrations or destructive seed scripts
- commands touching payment, auth, or webhook configuration

Hooks do not replace human review. They reduce obvious operational risk and create a useful audit trail.

---

## 12. MCP Strategy

Use MCP only when it improves output quality enough to justify extra context and tool permissions.

### Recommended MCP Servers

| MCP | Use | Policy |
|---|---|---|
| GitHub MCP | Issues, PRs, commits, Actions, code search | Prefer read-only for most agents |
| Playwright MCP | Localhost browser verification | Restrict to localhost |
| Docs/search MCP | Official framework docs lookup | Use for uncertain library behavior |
| Deployment provider MCP | Vercel/Render/Railway status | Optional, read-only first |
| Database MCP | Schema inspection in non-production | Avoid production access |

### MCP Token Reduction Rules

- Enable only required toolsets.
- Prefer read-only tools unless the task is explicitly to mutate GitHub state.
- Do not expose broad organization or account access to feature agents.
- Keep deployment and database MCPs separate from general coding agents.
- Document every MCP server purpose in `docs/ai-context/prompt-playbook.md`.

---

## 13. Google Antigravity Companion Workflow

Antigravity should complement Copilot, not replace the GitHub-native workflow.

Use Antigravity when the task benefits from editor, terminal, and browser verification in one loop:

- Frontend UI iteration.
- Streaming chat behavior verification.
- Razorpay checkout modal walkthrough in test mode.
- Full upload to summary to chat browser flow.
- Long-running bug reproduction.
- Screenshot and browser-recording artifacts for review.
- Parallel maintenance tasks on isolated workspaces.

### Antigravity Operating Model

1. Start from a clean branch.
2. Give the agent a feature brief, relevant files, and strict file ownership.
3. Ask it to produce a task list before editing.
4. Let it run local terminal and browser checks in a controlled workspace.
5. Require artifacts: screenshots, walkthroughs, test output, and changed-file summary.
6. Review artifacts first, then inspect the diff.
7. Bring final changes back through GitHub PR, CI, Copilot code review, and human review.

### Best Antigravity Assignments

| Assignment | Why Antigravity Fits |
|---|---|
| Dashboard visual polish | Browser screenshots show layout problems faster than text |
| Document viewer plus chat | Needs UI state, scrolling, streaming behavior, and browser checks |
| Auth flow walkthrough | Browser verification catches redirect and cookie mistakes |
| Payment checkout test flow | Requires UI, network calls, modal behavior, and callback verification |
| Bug reproduction | Agent can run app, interact in browser, capture evidence |

### Safety Rules

- Never run Antigravity from a home directory or broad system directory.
- Keep it inside the repo workspace or a disposable clone.
- Disable unattended destructive shell behavior.
- Review commands before approving terminal execution.
- Do not provide production secrets.
- Use test keys for Razorpay and development OpenAI keys with spending limits.
- Require screenshots or recordings for UI claims.

---

## 14. Context And Memory System

### Source Of Truth Hierarchy

Use this order when context conflicts:

1. Current code and tests.
2. `docs/01_FEATURES.md`.
3. `docs/02_TECH_STACK.md`.
4. `docs/ai-context/api-contracts.md`.
5. `docs/ai-context/architecture-decisions.md`.
6. `.github/copilot-instructions.md`.
7. Path-specific instructions.
8. Skills and prompt files.
9. Copilot Memory or Antigravity knowledge base.

Committed docs should win over tool memory. Memory is useful but should not silently override intentional decisions.

### What Goes Where

| Context Type | Location | Example |
|---|---|---|
| Stable repo conventions | `.github/copilot-instructions.md` | Use AppError, centralized config, feature IDs |
| Local file rules | `.github/instructions/*.instructions.md` | Payment webhook raw body rules |
| Reusable task flow | `.github/prompts/*.prompt.md` | Generate endpoint plus tests |
| Detailed procedures | `.github/skills/*/SKILL.md` | OpenAI SSE lifecycle |
| Human-readable specs | `docs/ai-context/*.md` | API contracts and architecture decisions |
| Learned patterns | Copilot Memory | "Document ownership checks use owner field on Document" |
| Visual workflow learnings | Antigravity knowledge base | "Dashboard cards overflow at 375px if filename is long" |

### Feature Brief Template

Create one small file per task under `docs/ai-context/feature-briefs/`.

```md
# Feature Brief: F18-F23 AI Integration

Goal:
- Add summary and streaming document chat.

In scope:
- Summary endpoint
- SSE chat endpoint
- Chat history
- Quota tracking
- Token bounds

Out of scope:
- UI polish
- Payments

Relevant files:
- server/src/features/ai/*
- server/src/features/documents/*
- server/src/features/users/*

Acceptance:
- Streams chunks over SSE
- Enforces document ownership
- Enforces free quota
- Saves chat history
- Tests pass
```

This is cheaper and more reliable than pasting the full feature document into every prompt.

---

## 15. Token Usage Reduction Strategy

Token reduction is mostly context discipline.

### Rules

1. Start every AI task with feature IDs and explicit scope.
2. Attach only relevant files, not the whole repo.
3. Prefer feature briefs over long pasted requirements.
4. Keep global instructions short.
5. Move detailed guidance into skills.
6. Use path-specific instructions instead of repeating frontend/backend/security rules.
7. Use prompt files for recurring task formats.
8. Restrict MCP toolsets to reduce tool schema overhead.
9. Use Copilot CLI `/context` to inspect context usage in long sessions.
10. Use `/compact` before switching feature phases.
11. Split large work into small PRs.
12. Ask agents to summarize decisions into `docs/ai-context/architecture-decisions.md` after meaningful changes.
13. Avoid sending full extracted PDF text to coding agents unless the task needs it.
14. Avoid chat transcripts as context; use short task summaries.
15. Keep generated plans concise and decision-complete.

### Good Prompt Shape

```text
Implement F12-F17 only.
Use docs/ai-context/feature-briefs/F12-F17-document-management.md.
Touch only server document upload/list/read/update/delete files and tests.
Use pdf-ingestion and production-security skills.
After implementation, run the relevant server tests and report failures.
```

### Bad Prompt Shape

```text
Build the whole app from the docs. Make it production ready.
```

The bad prompt causes broad edits, missed requirements, high token use, and weak validation.

---

## 16. Automation Pipeline

### Pull Request Pipeline

Every DocuMind PR should run:

1. Install dependencies with deterministic commands.
2. Lint server.
3. Lint client.
4. Run server tests.
5. Run client tests if configured.
6. Build client.
7. Build server or run startup smoke test.
8. Run dependency audit.
9. Run secret scanning where available.
10. Build Docker images.
11. Run Copilot code review.
12. Require human review for auth, payments, AI, deployment, and security changes.

### Example GitHub Actions Workflow

```yaml
name: ci

on:
  pull_request:
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: |
            server/package-lock.json
            client/package-lock.json

      - name: Install server
        run: npm ci
        working-directory: server

      - name: Install client
        run: npm ci
        working-directory: client

      - name: Lint server
        run: npm run lint
        working-directory: server

      - name: Test server
        run: npm test
        working-directory: server

      - name: Lint client
        run: npm run lint
        working-directory: client

      - name: Build client
        run: npm run build
        working-directory: client

      - name: Docker build server
        run: docker build -t documind-server ./server

      - name: Docker build client
        run: docker build -t documind-client ./client
```

Add deployment later only after CI is stable.

### AI-Triggered Automation

Use Copilot CLI programmatically for safe read-only or controlled tasks:

```bash
copilot -p "Summarize the last 5 commits and identify files needing docs updates" --allow-tool='shell(git)'
```

Avoid `--allow-all-tools` for DocuMind. It is too broad for a repo with payments, secrets, and deployment logic.

---

## 17. Step-By-Step Implementation Guidance

### Step 1: Create The AI Foundation

Add:

- `.github/copilot-instructions.md`
- `.github/instructions/*.instructions.md`
- `.github/prompts/*.prompt.md`
- `.github/agents/*.agent.md`
- `.github/skills/*/SKILL.md`
- `.github/hooks/copilot-policy.json`
- `docs/ai-context/*`

Do this before asking agents to implement large feature chunks.

### Step 2: Convert Features Into Issues

Create one GitHub issue per feature phase:

- Issue 1: F01-F05 Foundation
- Issue 2: F06-F11 Auth
- Issue 3: F12-F17 Documents
- Issue 4: F18-F23 AI
- Issue 5: F24-F29 Payments
- Issue 6: F30-F40 UI
- Issue 7: F41-F45 Security
- Issue 8: F46-F52 DevOps

Each issue should include:

- Feature IDs.
- In scope.
- Out of scope.
- Acceptance checks.
- Required validation commands.
- Preferred agent and skills.

### Step 3: Build Foundation Manually Assisted

Use Copilot locally for initial setup. Keep this phase close to the developer because conventions established here affect the entire project.

### Step 4: Use Cloud Agent For Bounded Backend Tasks

After foundation is stable, assign auth, documents, AI, and payments as separate branch tasks. Keep each branch small enough that review is realistic.

### Step 5: Use Antigravity For UI And Browser Verification

Use Antigravity once the API contract exists. Ask for:

- Screenshots.
- Browser recordings.
- Exact terminal commands.
- Failed state captures.
- Changed-file summary.

### Step 6: Add CI Before Feature Work Accelerates

Agents produce better results when CI gives immediate feedback. Add lint/build/test early, even if tests are minimal at first.

### Step 7: Add Security Gates

Before AI, payments, and deployment work:

- Add secret scanning.
- Add dependency audit.
- Add rate-limit tests.
- Add auth ownership tests.
- Add payment signature tests.

### Step 8: Use Copilot Code Review On Every PR

Configure automatic review for repository PRs if available. Treat Copilot review as a second reviewer, not as approval.

### Step 9: Maintain Context Files

After each phase, update:

- `docs/ai-context/api-contracts.md`
- `docs/ai-context/architecture-decisions.md`
- `docs/ai-context/prompt-playbook.md`
- `README.md`
- `DECISIONS.md`

### Step 10: Freeze Public Contracts Before Production

Before deployment:

- Freeze API paths and response shapes.
- Freeze env var names.
- Freeze plan limits.
- Freeze payment amount source.
- Freeze deployment targets.

### Step 11: Run Production Readiness Prompt

Use `production-readiness.prompt.md` before merging the deployment PR.

### Step 12: Monitor And Iterate

After deployment, create AI-assisted tasks for:

- Log review.
- Error triage.
- Slow endpoint inspection.
- Cost analysis.
- UI issue reproduction.
- Test coverage expansion.

---

## 18. Production-Ready AI Development Rules

### Auth

- Never store refresh tokens in localStorage.
- Hash passwords with bcrypt.
- Rotate refresh tokens.
- Invalidate tokens on logout.
- Test expired, forged, missing, and reused tokens.

### Documents

- Validate file type and size before extraction.
- Enforce ownership on every document operation.
- Clean up files after extraction failures.
- Do not send unbounded document text to AI.

### AI

- Use bounded context.
- Track usage per user.
- Enforce free-plan quotas server-side.
- Abort work on client disconnect where possible.
- Log token usage and model name without logging full sensitive document text.
- Treat document content as untrusted input.

### Payments

- Server controls amount and plan mapping.
- Verify every signature.
- Use raw body for Razorpay webhook verification.
- Make webhook processing idempotent.
- Never trust client callback alone for plan upgrade.

### Frontend

- Route protection should not replace backend authorization.
- Handle empty, loading, error, and success states.
- Do not leak tokens or secrets to browser storage.
- Verify responsive behavior with screenshots.

### DevOps

- Use environment variables for all secrets and URLs.
- Validate env vars at startup.
- Keep Docker images small and deterministic.
- Use CI for every PR.
- Keep deployment docs current.

---

## 19. Recommended Tools And Integrations

### Core AI Tools

- GitHub Copilot in VS Code for local pair programming.
- GitHub Copilot cloud agent for background issue/branch work.
- GitHub Copilot CLI for terminal-first tasks and scripted checks.
- GitHub Copilot code review for PR feedback.
- Google Antigravity for async browser-terminal-editor workflows and artifact review.

### MCP Integrations

- GitHub MCP for issues, PRs, Actions, and repository context.
- Playwright MCP for localhost browser testing.
- Documentation/search MCP for official framework docs.
- Optional deployment MCP for Vercel, Render, or Railway status.

### Engineering Tools

- ESLint and Prettier for consistent style.
- Jest or Vitest plus Supertest for backend tests.
- React Testing Library or Playwright for frontend tests.
- MongoDB Memory Server for isolated backend integration tests where useful.
- GitHub Actions for CI.
- Dependabot for dependency updates.
- GitHub secret scanning and code scanning where available.
- Docker and Docker Compose for local parity.
- Postman or Bruno for API collections.
- MongoDB Compass for development inspection.

---

## 20. AI Agent Work Queue

Use this queue to drive implementation quickly.

| Order | Work Item | Agent | Skill | Review Gate |
|---|---|---|---|---|
| 1 | AI repo scaffolding | documentation | none | Human |
| 2 | Foundation F01-F05 | backend-api | express-api-patterns | CI |
| 3 | Auth F06-F11 | backend-api | production-security | Security review |
| 4 | Documents F12-F17 | backend-api | pdf-ingestion | Security review |
| 5 | AI F18-F23 | ai-integration | openai-sse-chat | Cost/security review |
| 6 | Payments F24-F29 | payments | razorpay-payments | Manual payment review |
| 7 | UI F30-F40 | frontend-ui | react-dashboard-ui | Antigravity screenshots |
| 8 | Hardening F41-F45 | security-review | production-security | Copilot code review |
| 9 | DevOps F46-F52 | devops-ci | docker-deployment | CI and deploy smoke test |
| 10 | README/DECISIONS | documentation | none | Human |

---

## 21. Definition Of Done For AI-Generated Work

An AI-generated change is not done until:

- The scope matches the requested feature IDs.
- No unrelated refactors were added.
- New behavior has tests or a documented reason tests were not possible.
- Lint passes.
- Build passes.
- Security-sensitive paths have negative tests.
- Secrets are not added to code, logs, screenshots, or docs.
- Public API contracts are documented.
- Copilot code review has been considered.
- A human has reviewed the diff.
- For UI work, browser screenshots or recordings exist.
- For payments, test-mode payment and webhook paths are verified.
- For deployment, smoke tests and environment variables are documented.

---

## 22. Common Failure Modes And Mitigations

| Failure Mode | Mitigation |
|---|---|
| Agent edits too many files | Use feature briefs, file ownership, and custom agents |
| Repeated context explanations | Use instructions, skills, prompt files, and Memory |
| Token waste from huge prompts | Use concise briefs and attach only relevant files |
| Broken auth edge cases | Require negative tests for every auth PR |
| IDOR in document routes | Security instructions and ownership tests |
| Payment fraud risk | Server-side amount, signature verification, idempotent webhooks |
| AI cost overruns | Quotas, truncation, bounded history, token logging |
| UI claims without proof | Antigravity screenshots and browser recordings |
| Unsafe autonomous commands | Hooks, restricted MCP, no `--allow-all-tools` |
| Stale AI memory | Keep committed docs as source of truth and review Copilot Memory |

---

## 23. Practical Prompt Library

### Feature Planning

```text
Use docs/01_FEATURES.md and docs/02_TECH_STACK.md.
Create a decision-complete plan for F18-F23 only.
Include data models, endpoints, edge cases, tests, and validation commands.
Do not implement yet.
```

### Backend Implementation

```text
Use the backend-api agent and express-api-patterns skill.
Implement the approved plan for F12-F17.
Keep changes inside server document feature files and tests.
Run the relevant tests and report results.
```

### Frontend Implementation

```text
Use the frontend-ui agent and react-dashboard-ui skill.
Build the dashboard and upload UI against the documented API contract.
Include loading, empty, error, and success states.
Verify on desktop and mobile widths.
```

### Security Review

```text
Use the security-review agent and production-security skill.
Review this branch for auth bypass, IDOR, upload abuse, NoSQL injection, XSS, quota bypass, payment forgery, and secret leaks.
Return blocking issues first.
```

### Antigravity UI Verification

```text
Run the app locally and verify the document upload to chat flow in the browser.
Capture screenshots for dashboard, upload state, document viewer, streaming response, and mobile layout.
If anything fails, reproduce it, describe the root cause, and propose the smallest fix.
```

---

## 24. Rollout Plan

### Week 1: Build To Functional MVP

- Day 1: AI repo scaffolding plus foundation.
- Day 2: Auth.
- Day 3: Document upload and CRUD.
- Day 4: AI summary and streaming chat.
- Day 5: Razorpay test-mode payment flow.
- Day 6: Frontend flows.
- Day 7: Security, Docker, CI, README, deployment.

This mirrors the existing DocuMind feature schedule but adds AI-specific guardrails and review gates.

### Post-MVP Hardening

- Add Playwright end-to-end tests.
- Add structured API docs.
- Add request tracing IDs.
- Add production monitoring.
- Add AI cost dashboard for admin usage.
- Add retry and timeout policies for OpenAI and Razorpay.
- Add backup and restore notes for MongoDB Atlas.

---

## 25. Final Recommendation

Use GitHub Copilot as the system of record for implementation, review, memory, and GitHub workflow automation. Use Antigravity as a high-leverage companion for async multi-agent work and browser-visible verification. Keep both tools constrained by small feature briefs, scoped agents, reusable skills, CI gates, hooks, and human review.

The core principle is simple: let AI accelerate repetitive implementation and verification, but make the repository itself carry the rules. That is how DocuMind can move quickly without becoming fragile.

---

## Source Links

- GitHub Docs: [Repository custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)
- GitHub Docs: [Custom agents](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)
- GitHub Docs: [Agent skills](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills)
- GitHub Docs: [Hooks](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-hooks)
- GitHub Docs: [MCP for Copilot cloud agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/extend-cloud-agent-with-mcp)
- GitHub Docs: [Copilot code review](https://docs.github.com/en/copilot/concepts/agents/code-review)
- GitHub Docs: [Copilot CLI context management](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/context-management)
- GitHub Docs: [Copilot Memory](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-memory)
- Google Developers Blog: [Build with Google Antigravity](https://developers.googleblog.com/en/build-with-google-antigravity-our-new-agentic-development-platform/)
