# DocuMind AI

DocuMind AI is an AI-powered PDF document application with document upload, summarization, streaming document chat, authentication, Razorpay payments, and production deployment workflows.

The project is currently in foundation implementation. See:

- `docs/01_FEATURES.md` for the feature roadmap.
- `docs/02_TECH_STACK.md` for the selected stack.
- `docs/03_AI_CODING_WORKFLOW.md` for the AI-assisted development workflow.

## Local Setup

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Before starting the server, replace placeholder values in `.env`.

## Workspace Scripts

```bash
npm run dev          # run client and server
npm run dev:client   # run Vite client only
npm run dev:server   # run Express server only
npm run lint         # lint all workspaces
npm test             # run server tests
npm run build        # build/check all workspaces
npm run check        # lint, test, and build
```

