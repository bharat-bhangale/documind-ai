# DocuMind AI — Complete Tech Stack Reference

> **Version:** 1.0 | **Last Updated:** May 11, 2026

---

## OVERVIEW

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND                               │
│  React.js + Vite + Tailwind CSS + React Router           │
├──────────────────────────────────────────────────────────┤
│                    BACKEND                                │
│  Node.js + Express.js                                     │
├──────────────────────────────────────────────────────────┤
│                    DATABASE                               │
│  MongoDB Atlas + Mongoose ODM + Redis                     │
├──────────────────────────────────────────────────────────┤
│                  THIRD-PARTY APIs                         │
│  OpenAI API + Razorpay API                                │
├──────────────────────────────────────────────────────────┤
│                    DEVOPS                                  │
│  Docker + GitHub Actions + Vercel + Render                │
└──────────────────────────────────────────────────────────┘
```

---

## 1. FRONTEND

### Core Framework

| Technology | Version | Purpose | Why This Choice |
|---|---|---|---|
| **React.js** | 19.x | UI library | Industry standard, component-based, huge ecosystem |
| **Vite** | 6.x | Build tool & dev server | 10x faster than CRA, instant HMR, native ESM |
| **React Router** | 7.x | Client-side routing | Standard for SPAs, supports nested routes & lazy loading |

### Styling

| Technology | Purpose | Why This Choice |
|---|---|---|
| **Tailwind CSS** | Utility-first CSS framework | Rapid development, consistent design, tiny production bundle (purged) |
| **@tailwindcss/vite** | Vite plugin for Tailwind | Seamless integration with Vite build pipeline |

### State & Data Management

| Technology | Purpose | Why This Choice |
|---|---|---|
| **React Context API** | Global state (auth, theme) | Built-in, no extra dependency for simple global state |
| **Axios** | HTTP client | Interceptors for auth token refresh, clean API |
| **React Hook Form** (optional) | Form handling | Minimal re-renders, built-in validation |

### UI Utilities

| Technology | Purpose | Why This Choice |
|---|---|---|
| **React Hot Toast** | Toast notifications | Lightweight (3KB), great DX, promise-based |
| **Lucide React** | Icons | Modern, tree-shakeable, consistent icon set |
| **React Markdown** | Render AI markdown responses | AI often returns markdown-formatted text |

### Frontend npm install command:
```bash
npm install axios react-router-dom react-hot-toast lucide-react react-markdown
npm install -D tailwindcss @tailwindcss/vite
```

---

## 2. BACKEND

### Core Framework

| Technology | Version | Purpose | Why This Choice |
|---|---|---|---|
| **Node.js** | 20.x LTS | Runtime | Non-blocking I/O, same language as frontend |
| **Express.js** | 4.x | Web framework | Minimal, flexible, massive middleware ecosystem |
| **Nodemon** | 3.x | Dev auto-restart | Auto-restarts server on file changes |

### Authentication

| Technology | Purpose | Why This Choice |
|---|---|---|
| **jsonwebtoken** | JWT creation & verification | Industry standard for stateless auth tokens |
| **bcryptjs** | Password hashing | Pure JS (no native deps), 12 salt rounds for security |
| **cookie-parser** | Parse cookies from requests | Required for HttpOnly refresh token cookies |

### File Handling

| Technology | Purpose | Why This Choice |
|---|---|---|
| **multer** | File upload middleware | Standard for Express, supports file size/type limits |
| **pdf-parse** | PDF text extraction | Lightweight, fast, simple API for digital PDFs |

### Validation & Security

| Technology | Purpose | Why This Choice |
|---|---|---|
| **joi** | Request body validation | Declarative schemas, detailed error messages |
| **helmet** | HTTP security headers | Sets 11+ security headers in one line |
| **cors** | Cross-Origin Resource Sharing | Required for frontend-backend communication |
| **express-rate-limit** | API rate limiting | Prevents brute-force and DDoS attacks |
| **express-mongo-sanitize** | NoSQL injection prevention | Strips `$` and `.` from user input |

### Logging

| Technology | Purpose | Why This Choice |
|---|---|---|
| **morgan** | HTTP request logger | Logs method, URL, status, response time |
| **winston** | Application logger | Log levels, file transport, structured JSON logs |

### Backend npm install command:
```bash
# Production dependencies
npm install express mongoose cors dotenv bcryptjs jsonwebtoken cookie-parser
npm install multer pdf-parse openai razorpay
npm install joi helmet morgan winston express-rate-limit express-mongo-sanitize

# Development dependencies
npm install -D nodemon
```

---

## 3. DATABASE

### Primary Database

| Technology | Purpose | Why This Choice |
|---|---|---|
| **MongoDB Atlas** | Cloud-hosted document database | Free tier, auto-scaling, global clusters, no server management |
| **Mongoose** | ODM (Object Document Mapper) | Schema validation, middleware hooks, population, clean query API |

### Caching (Optional but recommended)

| Technology | Purpose | Why This Choice |
|---|---|---|
| **Redis** | Rate limiting store + caching | In-memory speed, TTL support, distributed rate limiting |
| **rate-limit-redis** | Redis adapter for express-rate-limit | Enables rate limiting across multiple server instances |

### Database npm install:
```bash
npm install mongoose redis rate-limit-redis
```

---

## 4. AI INTEGRATION

| Technology | Purpose | Why This Choice |
|---|---|---|
| **OpenAI SDK** (`openai` npm) | AI chat completions & streaming | Official SDK, TypeScript support, streaming built-in |
| **GPT-4o-mini** model | Document Q&A and summarization | Cheapest model ($0.15/1M input tokens), fast, sufficient quality |

### Cost Estimates (GPT-4o-mini):
| Operation | Avg Tokens | Cost per Request |
|---|---|---|
| Summarize document | ~2000 in + ~500 out | ~$0.0004 |
| Chat query | ~3000 in + ~300 out | ~$0.0005 |
| 1000 users × 10 queries/day | ~30M tokens/month | ~$5/month |

### AI npm install:
```bash
npm install openai
```

---

## 5. PAYMENT GATEWAY

| Technology | Purpose | Why This Choice |
|---|---|---|
| **Razorpay Node.js SDK** | Server-side order creation & verification | India-focused, UPI/cards/wallets, excellent docs |
| **Razorpay Checkout.js** | Frontend payment modal | Pre-built, secure, PCI-compliant UI |
| **crypto** (built-in) | HMAC-SHA256 signature verification | Verify payment authenticity, no extra dependency |

### Razorpay npm install:
```bash
npm install razorpay
```

### Frontend script (loaded dynamically):
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## 6. DEVOPS & DEPLOYMENT

### Containerization

| Technology | Purpose | Why This Choice |
|---|---|---|
| **Docker** | Containerize frontend + backend | Consistent environments, easy deployment |
| **Docker Compose** | Multi-container orchestration | Define all services in one YAML file |
| **nginx:alpine** | Serve React static files | 25MB image, fast, handles SPA routing |

### CI/CD

| Technology | Purpose | Why This Choice |
|---|---|---|
| **GitHub Actions** | Automated CI/CD pipeline | Free for public repos, integrated with GitHub |

### Hosting

| Service | What It Hosts | Cost |
|---|---|---|
| **Vercel** | React frontend | Free tier |
| **Render** or **Railway** | Node.js backend | Free tier (with limitations) |
| **MongoDB Atlas** | Database | Free tier (512MB) |
| **Redis Cloud** | Rate limiting cache | Free tier (30MB) |

---

## 7. DEVELOPMENT TOOLS

| Tool | Purpose |
|---|---|
| **VS Code** | Code editor |
| **Postman** | API testing |
| **MongoDB Compass** | Database GUI |
| **GitHub** | Version control & collaboration |
| **GitHub Copilot / Cursor** | AI-assisted coding |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

---

## 8. COMPLETE PACKAGE SUMMARY

### Server — package.json dependencies:
```json
{
  "dependencies": {
    "express": "^4.21.x",
    "mongoose": "^8.x",
    "cors": "^2.8.x",
    "dotenv": "^16.x",
    "bcryptjs": "^2.4.x",
    "jsonwebtoken": "^9.x",
    "cookie-parser": "^1.4.x",
    "multer": "^1.4.x",
    "pdf-parse": "^1.1.x",
    "openai": "^4.x",
    "razorpay": "^2.9.x",
    "joi": "^17.x",
    "helmet": "^8.x",
    "morgan": "^1.10.x",
    "winston": "^3.x",
    "express-rate-limit": "^7.x",
    "express-mongo-sanitize": "^2.2.x",
    "redis": "^4.x",
    "rate-limit-redis": "^4.x"
  },
  "devDependencies": {
    "nodemon": "^3.x"
  }
}
```

### Client — package.json dependencies:
```json
{
  "dependencies": {
    "axios": "^1.7.x",
    "react-router-dom": "^7.x",
    "react-hot-toast": "^2.4.x",
    "lucide-react": "^0.4x",
    "react-markdown": "^9.x"
  },
  "devDependencies": {
    "tailwindcss": "^4.x",
    "@tailwindcss/vite": "^4.x"
  }
}
```

### Total package count:
- **Server:** 18 production + 1 dev = **19 packages**
- **Client:** 5 production + 2 dev = **7 packages**
- **Total:** **26 npm packages**

---

## 9. EXTERNAL ACCOUNTS NEEDED

| Service | What You Need | Link | Cost |
|---|---|---|---|
| **MongoDB Atlas** | Database cluster | mongodb.com/atlas | Free (M0 tier) |
| **OpenAI** | API key | platform.openai.com | Pay-per-use (~$5 credit free) |
| **Razorpay** | Test mode API keys | dashboard.razorpay.com | Free (test mode) |
| **GitHub** | Repository | github.com | Free |
| **Vercel** | Frontend hosting | vercel.com | Free (hobby) |
| **Render** or **Railway** | Backend hosting | render.com / railway.app | Free tier |
| **Docker Hub** (optional) | Image registry | hub.docker.com | Free |

---

## 10. VERSION COMPATIBILITY MATRIX

| Technology | Minimum Version | Recommended |
|---|---|---|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| MongoDB | 6.0 | 7.0+ |
| React | 18.x | 19.x |
| Vite | 5.x | 6.x |
| Docker | 24.x | 27.x |
| Docker Compose | 2.x | 2.29+ |

---

*Tech stack finalized: May 11, 2026. All technologies are production-proven and actively maintained.*
