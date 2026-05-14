import { FileText, ShieldCheck, Sparkles } from "lucide-react";

const foundations = [
  {
    title: "Document workspace",
    description: "Upload, organize, and prepare PDFs for summarization and document chat.",
    icon: FileText
  },
  {
    title: "AI-ready backend",
    description: "The server foundation includes validated config, health checks, logging, and errors.",
    icon: Sparkles
  },
  {
    title: "Production guardrails",
    description: "The build starts with CI, security headers, strict env handling, and review workflow docs.",
    icon: ShieldCheck
  }
];

function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            DocuMind AI
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            AI document intelligence, built on a production-first foundation.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            This first implementation milestone creates the project shell. Auth,
            PDF upload, AI chat, Razorpay, and the complete dashboard will be added
            in the documented feature sequence.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {foundations.map((item) => {
            const Icon = item.icon;

            return (
              <article
                className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
                key={item.title}
              >
                <Icon className="mb-4 h-6 w-6 text-cyan-300" aria-hidden="true" />
                <h2 className="text-lg font-medium">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default App;

