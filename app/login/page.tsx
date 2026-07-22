"use client";

import type React from "react";
import { useState } from "react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred. Please try again.");
      }

      // Success - redirect to dashboard
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-teal-700">Kusco</h1>
          <p className="text-slate-500 mt-2">Clinician AI Assistant & Patient Management</p>
        </div>

        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`flex-1 pb-3 text-center font-semibold text-sm ${
              isLogin
                ? "border-b-2 border-teal-600 text-teal-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`flex-1 pb-3 text-center font-semibold text-sm ${
              !isLogin
                ? "border-b-2 border-teal-600 text-teal-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="clinician@hospital.org"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 py-3 text-sm font-semibold text-white transition-colors duration-200 disabled:bg-slate-300"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Register Clinician Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Secure, HIPAA-compliant storage of clinical summaries.
        </div>
      </div>
    </div>
  );
}
