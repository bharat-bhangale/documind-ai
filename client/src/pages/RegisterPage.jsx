import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

/**
 * Registration page with name, email, and password fields.
 */
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ name: name.trim(), email, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 pt-20 pb-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2">
        <div className="h-[400px] w-[600px] rounded-full bg-violet-500/6 blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/15 to-cyan-500/15">
            <UserPlus className="h-7 w-7 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-slate-400">
            Start chatting with your documents for free
          </p>
        </div>

        {/* Form card */}
        <div className="glass-card p-6 sm:p-8">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="register-name"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                disabled={isSubmitting}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input pr-10"
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Confirm password
              </label>
              <input
                id="register-confirm-password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2.5"
              id="register-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-cyan-400 hover:text-cyan-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
