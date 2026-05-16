import {
  Check,
  Crown,
  Loader2,
  Shield,
  Sparkles,
  X as XIcon,
  Zap
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../contexts/AuthContext";
import api from "../lib/api";

const FREE_FEATURES = [
  { included: true, text: "Upload up to 3 documents" },
  { included: true, text: "5 MB max file size" },
  { included: true, text: "10 AI queries per day" },
  { included: true, text: "AI document summaries" },
  { included: true, text: "Document chat" },
  { included: false, text: "Priority AI responses" },
  { included: false, text: "Larger file uploads (10 MB)" },
  { included: false, text: "Unlimited AI queries" }
];

const PRO_FEATURES = [
  { included: true, text: "Unlimited documents" },
  { included: true, text: "10 MB max file size" },
  { included: true, text: "Unlimited AI queries" },
  { included: true, text: "AI document summaries" },
  { included: true, text: "Document chat" },
  { included: true, text: "Priority AI responses" },
  { included: true, text: "Larger file uploads (10 MB)" },
  { included: true, text: "Early access to new features" }
];

/**
 * Loads the Razorpay checkout script dynamically.
 * Only loads once; subsequent calls return the cached script.
 */
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = window.document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK."));
    window.document.head.appendChild(script);
  });
}

/**
 * Pricing page showing Free vs Pro plan comparison.
 * Pro plan triggers Razorpay checkout flow.
 */
export default function PricingPage() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const isPro = user?.plan === "pro";

  async function handleUpgrade() {
    if (!isAuthenticated) {
      toast.error("Please log in to upgrade your plan.");
      return;
    }

    if (isPro) {
      toast("You're already on the Pro plan! 🎉");
      return;
    }

    setIsProcessing(true);

    try {
      /* 1. Load Razorpay script */
      await loadRazorpayScript();

      /* 2. Create payment order on backend */
      const { data } = await api.post("/payments/orders");
      const { checkout } = data.data;

      /* 3. Open Razorpay modal */
      const options = {
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: checkout.name,
        description: checkout.description,
        order_id: checkout.orderId,
        prefill: checkout.prefill,
        theme: checkout.theme,

        handler: async (response) => {
          /* 4. Verify payment on backend */
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.success("🎉 Welcome to Pro! Your account has been upgraded.");
            await refreshUser();
          } catch {
            toast.error(
              "Payment verification failed. Please contact support if money was deducted."
            );
          }
        },

        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Payment failed."
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="min-h-screen px-4 pt-28 pb-20 sm:px-6">
      {/* Background glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2">
        <div className="h-[500px] w-[700px] rounded-full bg-violet-500/6 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
            <Crown className="h-4 w-4" />
            Pricing
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-slate-400">
            Start free and upgrade when you need more. No hidden fees, no
            surprises.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Free Plan */}
          <div className="glass-card flex flex-col p-7">
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-slate-400" />
                <h2 className="text-xl font-bold">Free</h2>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">₹0</span>
                <span className="text-sm text-slate-500">forever</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Perfect for trying out DocuMind
              </p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {FREE_FEATURES.map((feature) => (
                <li key={feature.text} className="flex items-start gap-3 text-sm">
                  {feature.included ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <XIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                  )}
                  <span
                    className={
                      feature.included ? "text-slate-300" : "text-slate-600"
                    }
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="rounded-lg border border-white/10 bg-white/5 py-2.5 text-center text-sm font-medium text-slate-400">
                Your previous plan
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 py-2.5 text-center text-sm font-medium text-emerald-400">
                <Check className="mr-1.5 inline h-4 w-4" />
                Current Plan
              </div>
            )}
          </div>

          {/* Pro Plan */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-500/10 to-transparent p-7">
            {/* Popular badge */}
            <div className="absolute top-4 right-4">
              <span className="badge badge-pro flex items-center gap-1 px-3 py-1">
                <Sparkles className="h-3 w-3" />
                Popular
              </span>
            </div>

            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <Crown className="h-5 w-5 text-violet-400" />
                <h2 className="text-xl font-bold">Pro</h2>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">₹299</span>
                <span className="text-sm text-slate-500">one-time</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Unlimited AI power for serious users
              </p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {PRO_FEATURES.map((feature) => (
                <li key={feature.text} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                  <span className="text-slate-300">{feature.text}</span>
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 py-2.5 text-center text-sm font-medium text-violet-300">
                <Crown className="mr-1.5 inline h-4 w-4" />
                Active Plan
              </div>
            ) : (
              <button
                id="upgrade-pro-btn"
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="btn-primary w-full bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-base shadow-lg shadow-violet-500/25"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    Upgrade to Pro
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-center text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            Secure payments via Razorpay
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4" />
            Instant activation
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            One-time payment, lifetime access
          </div>
        </div>
      </div>
    </main>
  );
}
