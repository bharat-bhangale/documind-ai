# DocuMind AI — Complete Feature Specification

> **Version:** 1.0 | **Last Updated:** May 11, 2026

---

## PART 1: Feature List (Sequential Build Order)

### Phase 1 — Foundation (Day 1)
| # | Feature | Priority |
|---|---|---|
| F01 | Project Setup & Configuration | 🔴 Critical |
| F02 | Environment Variable Management | 🔴 Critical |
| F03 | Database Connection & Health Check | 🔴 Critical |
| F04 | Centralized Error Handling | 🔴 Critical |
| F05 | Request Logging | 🟡 High |

### Phase 2 — Authentication (Day 1–2)
| # | Feature | Priority |
|---|---|---|
| F06 | User Registration with Validation | 🔴 Critical |
| F07 | User Login with JWT Access Token | 🔴 Critical |
| F08 | JWT Refresh Token Rotation | 🔴 Critical |
| F09 | Auth Middleware (Route Protection) | 🔴 Critical |
| F10 | Logout & Token Invalidation | 🟡 High |
| F11 | Get Current User Profile | 🟡 High |
| F12 | Login with google oauth | 🟡 High |

### Phase 3 — Document Management (Day 2–3)
| # | Feature | Priority |
|---|---|---|
| F12 | PDF File Upload with Multer | 🔴 Critical |
| F13 | PDF Text Extraction | 🔴 Critical |
| F14 | Document CRUD Operations | 🔴 Critical |
| F15 | Paginated Document Listing | 🟡 High |
| F16 | Document Ownership Validation | 🔴 Critical |
| F17 | Upload Limits (Free vs Pro) | 🟡 High |

### Phase 4 — AI Integration (Day 3–4)
| # | Feature | Priority |
|---|---|---|
| F18 | AI Document Summarization | 🔴 Critical |
| F19 | AI Chat with Document (Streaming) | 🔴 Critical |
| F20 | Server-Sent Events (SSE) Streaming | 🔴 Critical |
| F21 | Chat History Storage & Retrieval | 🟡 High |
| F22 | AI Usage Quota Management | 🟡 High |
| F23 | AI Cost Optimization (Token Limits) | 🟡 High |

### Phase 5 — Payment Gateway (Day 4–5)
| # | Feature | Priority |
|---|---|---|
| F24 | Razorpay Order Creation | 🔴 Critical |
| F25 | Frontend Razorpay Checkout Modal | 🔴 Critical |
| F26 | Payment Signature Verification | 🔴 Critical |
| F27 | Webhook Handler for Payment Events | 🔴 Critical |
| F28 | User Plan Upgrade (Free → Pro) | 🔴 Critical |
| F29 | Payment History | 🟢 Medium |

### Phase 6 — Frontend UI (Day 5–6)
| # | Feature | Priority |
|---|---|---|
| F30 | Landing Page | 🟡 High |
| F31 | Auth Pages (Login/Register) | 🔴 Critical |
| F32 | Dashboard (Document List) | 🔴 Critical |
| F33 | Document Upload Component | 🔴 Critical |
| F34 | Document Viewer + AI Chat | 🔴 Critical |
| F35 | Streaming Chat UI (Typewriter) | 🟡 High |
| F36 | Pricing Page + Checkout | 🟡 High |
| F37 | Protected Routes | 🔴 Critical |
| F38 | Toast Notifications | 🟢 Medium |
| F39 | Loading States & Skeletons | 🟡 High |
| F40 | Responsive Design | 🟡 High |

### Phase 7 — Security & Production (Day 6)
| # | Feature | Priority |
|---|---|---|
| F41 | API Rate Limiting | 🟡 High |
| F42 | Input Validation (Joi/Zod) | 🔴 Critical |
| F43 | CORS Configuration | 🔴 Critical |
| F44 | Security Headers (Helmet) | 🟡 High |
| F45 | XSS & NoSQL Injection Prevention | 🟡 High |

### Phase 8 — DevOps & Deployment (Day 6–7)
| # | Feature | Priority |
|---|---|---|
| F46 | Docker — Backend Dockerfile | 🟡 High |
| F47 | Docker — Frontend Dockerfile (Multi-stage) | 🟡 High |
| F48 | Docker Compose (Full Stack) | 🟡 High |
| F49 | GitHub Actions CI Pipeline | 🟡 High |
| F50 | Production Deployment | 🔴 Critical |
| F51 | README.md Documentation | 🔴 Critical |
| F52 | DECISIONS.md (Architecture Rationale) | 🟡 High |

**Total Features: 52**

---

## PART 2: Detailed Feature Descriptions

---

### F01: Project Setup & Configuration

**What:** Initialize a monorepo with separate `client/` (React) and `server/` (Express) directories. Set up package.json scripts, ESLint, .gitignore.

**Why it's necessary:**
- Clean separation allows independent deployment (frontend on Vercel, backend on Render)
- Feature-based folder structure scales better than MVC for interviews and real teams
- Shows you understand production project organization

**Implementation:**
```
documind-ai/
├── client/           # React + Vite + Tailwind
├── server/           # Express + Mongoose
├── docker-compose.yml
├── .github/workflows/
├── README.md
└── DECISIONS.md
```

---

### F02: Environment Variable Management

**What:** Centralized config file that loads, validates, and exports all environment variables. Crash on startup if required vars are missing.

**Why it's necessary:**
- Prevents silent failures from undefined env vars in production
- Single source of truth — no `process.env.X` scattered across the codebase
- Shows interviewers you think about deployment reliability

**Key variables:** `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `OPENAI_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLIENT_URL`

---

### F03: Database Connection & Health Check

**What:** MongoDB connection via Mongoose with connection event handling + `/api/health` endpoint that reports server status, uptime, and DB connectivity.

**Why it's necessary:**
- Health checks are standard in production — used by load balancers, Docker, and monitoring tools
- Connection event listeners (`disconnected`, `error`) prevent silent DB failures
- Interview question: "How do you monitor your app in production?"

---

### F04: Centralized Error Handling

**What:** Custom `AppError` class + global Express error middleware that catches all errors, logs them, and returns consistent JSON responses.

**Why it's necessary:**
- Without this, unhandled errors crash the server or leak stack traces to users
- Consistent error response format (`{ success, message, statusCode }`) is required for frontend error handling
- Distinguishes between operational errors (user input) and programmer errors (bugs)

```javascript
// AppError class — statusCode + isOperational flag
// Global middleware — catches all errors, returns clean JSON
// Never expose stack traces in production (only in development)
```

---

### F05: Request Logging

**What:** Morgan for HTTP request logging (dev format locally, combined format in production). Winston for structured application logging.

**Why it's necessary:**
- Debugging in production is impossible without logs
- Morgan logs every HTTP request (method, URL, status, response time)
- Winston provides log levels (info, warn, error) and can write to files or external services

---

### F06–F11: Authentication System

**What:** Complete JWT auth with access tokens (15min), refresh tokens (7 days) stored in HttpOnly cookies, bcrypt password hashing, and token rotation.

**Why it's necessary:**
- JWT is the standard for stateless API authentication
- Refresh token rotation prevents token reuse attacks
- HttpOnly cookies prevent XSS-based token theft
- This is asked in 90%+ of interviews

**How it works:**
```
Register → Hash password (bcrypt, 12 rounds) → Save user → Return tokens
Login → Verify password → Generate access + refresh tokens → Set cookie
Refresh → Verify old refresh token → Invalidate it → Issue new pair
Logout → Clear cookie → Remove refresh token from DB
Protected Route → Auth middleware verifies access token → Attach user to req
```

**Key interview talking points:**
- "I use 15-minute access tokens to minimize exposure if stolen"
- "Refresh tokens are in HttpOnly cookies — JavaScript can't access them, preventing XSS"
- "On refresh, the old token is invalidated (rotation) — if a stolen token is reused, all tokens for that user are revoked"

---

### F12–F17: Document Management

**What:** Upload PDFs via multer (max 10MB), extract text with `pdf-parse`, store metadata in MongoDB, CRUD operations with ownership checks and pagination.

**Why it's necessary:**
- Core business logic — this is what the product does
- Shows file handling expertise (multer config, file size limits, MIME validation)
- Pagination shows you understand large dataset handling
- Ownership validation prevents unauthorized access (IDOR vulnerability)

**Free vs Pro limits:**
| Feature | Free | Pro |
|---|---|---|
| Max documents | 3 | Unlimited |
| Max file size | 5MB | 10MB |
| AI queries/day | 10 | Unlimited |

**Why limits exist (interview answer):** "Limits control API costs and create an incentive to upgrade. I track usage in the user document and reset daily quotas with a scheduled check."

---

### F18–F23: AI Integration

**What:** OpenAI GPT-4o-mini for document summarization and conversational Q&A. Streaming responses via Server-Sent Events (SSE). Chat history stored in MongoDB.

**Why it's necessary:**
- AI integration is the core differentiator of this project
- Streaming via SSE shows real-time data handling (alternative to WebSockets)
- Chat history shows data persistence and context management
- Cost optimization shows production thinking

**SSE vs WebSocket (interview answer):**
"I chose SSE because AI responses are unidirectional — data flows only from server to client. SSE is simpler, auto-reconnects on failure, and works over standard HTTP. WebSockets are overkill for one-way streaming."

**Cost optimization strategies:**
1. Use `gpt-4o-mini` (cheapest, fastest) instead of `gpt-4o`
2. Set `max_tokens: 1000` to cap response length
3. Send only last 6 messages as context (not entire history)
4. Truncate document text to 8000 characters for context window
5. Track token usage per user for billing and monitoring
6. Abort stream on client disconnect (save tokens)

---

### F24–F29: Payment Gateway (Razorpay)

**What:** Razorpay integration for one-time ₹299 Pro plan upgrade. Includes order creation, frontend checkout modal, server-side signature verification, and webhook handling.

**Why it's necessary:**
- Payment integration is a production-critical skill
- Signature verification prevents payment manipulation/fraud
- Webhooks ensure database consistency even if the user closes the browser
- Shows you understand financial data security

**The 11-step payment flow:**
1. User clicks "Upgrade to Pro" on pricing page
2. Frontend calls `POST /api/payment/create-order` with amount
3. Backend creates Razorpay order via SDK (amount in paise: 29900)
4. Backend saves order to MongoDB with status "created"
5. Backend returns `order_id` to frontend
6. Frontend opens Razorpay Checkout modal with `order_id`
7. User enters card/UPI details and completes payment
8. Razorpay returns `payment_id`, `order_id`, `signature` to frontend handler
9. Frontend sends all three to `POST /api/payment/verify`
10. Backend generates expected signature using HMAC-SHA256 and compares
11. If valid → update `user.plan = 'pro'` + save payment record

**Webhook (backup verification):**
- Razorpay sends `payment.captured` event to your webhook URL
- Must use `express.raw()` for body parsing (not `express.json()`)
- Verify `X-Razorpay-Signature` header before processing
- Idempotent: check if payment already processed before updating

---

### F30–F40: Frontend UI

**What:** Complete React frontend with landing page, auth pages, dashboard, document viewer with AI chat, pricing page, and responsive design.

**Key components:**

| Page/Component | Purpose |
|---|---|
| `LandingPage` | Hero section, feature highlights, CTA buttons |
| `LoginPage` / `RegisterPage` | Auth forms with validation feedback |
| `Dashboard` | Grid of document cards with status badges, upload button |
| `DocumentViewer` | Left panel: extracted text. Right panel: AI chat |
| `ChatInterface` | Message bubbles, streaming text display, input bar |
| `PricingPage` | Free vs Pro comparison, Razorpay checkout trigger |
| `ProtectedRoute` | Wrapper that redirects to login if not authenticated |
| `Navbar` | Logo, nav links, user avatar, plan badge |

**Streaming UI (typewriter effect):**
```javascript
// EventSource connects to SSE endpoint
// Each chunk appended to the current message state
// Auto-scroll to bottom on each chunk
// "Thinking..." indicator while waiting for first chunk
```

---

### F41–F45: Security & Production Hardening

**What:** Rate limiting (express-rate-limit), input validation (Joi), CORS configuration, security headers (Helmet), and sanitization.

**Why each is necessary:**

| Security Feature | Threat It Prevents |
|---|---|
| Rate Limiting | DDoS, brute-force login, API abuse |
| Input Validation (Joi) | Invalid data, schema injection |
| CORS | Unauthorized cross-origin requests |
| Helmet | Clickjacking, XSS via headers, MIME sniffing |
| mongo-sanitize | NoSQL injection (`{ "$gt": "" }` attacks) |

---

### F46–F52: DevOps & Deployment

**Docker — Backend:**
- `node:20-alpine` base image for small size
- `npm ci --only=production` for deterministic, lean install
- Expose port 5000, run with `node src/app.js`

**Docker — Frontend (Multi-stage):**
- Stage 1: `node:20-alpine` → install deps + `npm run build`
- Stage 2: `nginx:alpine` → copy built assets → serve static files
- Final image: ~25–50MB (vs ~1.2GB without multi-stage)
- Custom `nginx.conf` with `try_files` for SPA routing

**Docker Compose:**
- 3 services: `client`, `server`, `redis`
- Shared network for inter-container communication
- Environment variables injected at runtime

**GitHub Actions CI:**
- Trigger: push to `main` or pull request
- Steps: checkout → setup Node → install → lint → build → docker build
- Secrets stored in GitHub repository settings

**Documentation:**
- `README.md`: Project overview, screenshots, setup guide, API docs, deployment
- `DECISIONS.md`: Why you chose each technology (MongoDB, SSE, Razorpay, etc.)
