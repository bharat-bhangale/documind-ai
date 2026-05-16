import { ArrowLeft, FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * 404 Not Found page for unmatched routes.
 */
export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10">
        <FileQuestion className="h-10 w-10 text-cyan-400" />
      </div>
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-lg text-slate-400">Page not found</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-8">
        <ArrowLeft className="h-4 w-4" />
        Go home
      </Link>
    </main>
  );
}
