import {
  ArrowRight,
  Bot,
  FileText,
  Lock,
  MessageSquare,
  Sparkles,
  Upload,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

const FEATURES = [
  {
    icon: Upload,
    title: "Smart PDF Upload",
    description:
      "Drag and drop your PDFs. We extract text automatically and prepare it for AI analysis in seconds.",
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    icon: Sparkles,
    title: "AI Summaries",
    description:
      "Get instant, intelligent summaries powered by GPT-4o. Understand any document in under a minute.",
    gradient: "from-violet-500 to-purple-600"
  },
  {
    icon: MessageSquare,
    title: "Document Chat",
    description:
      "Ask questions about your documents and get accurate, context-aware answers with streaming responses.",
    gradient: "from-amber-500 to-orange-600"
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description:
      "Your documents are encrypted and never shared. Authentication with JWT and secure cookie sessions.",
    gradient: "from-emerald-500 to-green-600"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Real-time streaming chat with server-sent events. No waiting for complete responses.",
    gradient: "from-pink-500 to-rose-600"
  },
  {
    icon: Bot,
    title: "Context-Aware AI",
    description:
      "The AI remembers your conversation history and references your document content for precise answers.",
    gradient: "from-indigo-500 to-blue-600"
  }
];

const STEPS = [
  {
    step: "01",
    title: "Upload a PDF",
    description: "Drag and drop or browse to upload your PDF document."
  },
  {
    step: "02",
    title: "AI processes it",
    description: "Text is extracted and indexed for intelligent analysis."
  },
  {
    step: "03",
    title: "Chat & Summarize",
    description: "Ask questions or generate summaries instantly."
  }
];

/**
 * Landing page with hero, features grid, how-it-works, and CTA.
 */
export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen">
      {/* ── Hero Section ─────────────────── */}
      <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2">
          <div className="h-[500px] w-[800px] rounded-full bg-cyan-500/8 blur-[120px]" />
        </div>
        <div className="pointer-events-none absolute top-40 right-0">
          <div className="h-[300px] w-[400px] rounded-full bg-violet-500/6 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-300">
            <Sparkles className="h-4 w-4" />
            Powered by GPT-4o
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Chat with your
            <br />
            <span className="gradient-text">documents</span> using AI
          </h1>

          {/* Subheadline */}
          <p
            className="animate-slide-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400"
            style={{ animationDelay: "0.1s" }}
          >
            Upload any PDF and get instant AI-powered summaries, ask questions,
            and extract insights — all with real-time streaming responses.
          </p>

          {/* CTA buttons */}
          <div
            className="animate-slide-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            style={{ animationDelay: "0.2s" }}
          >
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn-primary px-8 py-3 text-base"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary px-8 py-3 text-base"
                  id="hero-cta-signup"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary px-8 py-3 text-base"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>

          {/* Trust indicator */}
          <p
            className="animate-fade-in mt-6 text-xs text-slate-600"
            style={{ animationDelay: "0.3s" }}
          >
            No credit card required • 10 free AI queries daily
          </p>
        </div>
      </section>

      {/* ── Features Grid ────────────────── */}
      <section className="px-4 py-20 sm:px-6" id="features-section">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Features
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Everything you need to understand your documents
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="glass-card animate-fade-in p-6"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-15`}
                    style={{ background: `linear-gradient(135deg, rgba(${getGradientRgb(feature.gradient)}, 0.15), rgba(${getGradientRgb(feature.gradient)}, 0.05))` }}
                  >
                    <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              How it works
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Three simple steps
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((item, index) => (
              <div
                key={item.step}
                className="animate-slide-up text-center"
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 text-xl font-bold text-cyan-400">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────── */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass-card px-8 py-12">
            <FileText className="mx-auto mb-4 h-10 w-10 text-cyan-400" />
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to unlock your documents?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-400">
              Start chatting with your PDFs in under a minute. No setup, no
              complexity — just upload and ask.
            </p>
            <div className="mt-8">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-primary px-8 py-3 text-base"
                >
                  Open Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="btn-primary px-8 py-3 text-base"
                  id="bottom-cta-signup"
                >
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────── */}
      <footer className="border-t border-white/5 px-4 py-8 text-center text-xs text-slate-600">
        <p>© {new Date().getFullYear()} DocuMind AI. Built with ❤️ using MERN + OpenAI.</p>
      </footer>
    </main>
  );
}

/* Helper to map gradient class names to approximate RGB for inline styles */
function getGradientRgb(gradient: string) {
  const colorMap: Record<string, string> = {
    "from-cyan-500 to-blue-600": "6, 182, 212",
    "from-violet-500 to-purple-600": "139, 92, 246",
    "from-amber-500 to-orange-600": "245, 158, 11",
    "from-emerald-500 to-green-600": "16, 185, 129",
    "from-pink-500 to-rose-600": "236, 72, 153",
    "from-indigo-500 to-blue-600": "99, 102, 241"
  };

  return colorMap[gradient] || "6, 182, 212";
}
