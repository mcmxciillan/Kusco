"use client";

import { useState } from "react";

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize Stripe checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe checkout URL not returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Billing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && <div className="mb-3 text-sm font-medium text-red-600">{error}</div>}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 py-3 text-sm font-semibold text-white transition-colors duration-200 disabled:bg-slate-300"
      >
        {loading ? "Redirecting to checkout..." : "Subscribe Now - $29/mo"}
      </button>
    </div>
  );
}
