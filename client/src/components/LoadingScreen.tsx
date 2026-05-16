import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

/**
 * Full-page loading spinner shown during auth bootstrap
 * and lazy-loaded route transitions.
 */
export default function LoadingScreen({ message = "Loading…" }: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2
        className="h-8 w-8 animate-spin text-cyan-400"
        aria-hidden="true"
      />
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
