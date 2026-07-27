"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage({ clinicianEmail }: { clinicianEmail?: string | null }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [sessionsPerWeek, setSessionsPerWeek] = useState<number>(20);
  const [hourlyRate, setHourlyRate] = useState<number>(150);
  const [activeTab, setActiveTab] = useState<"SOAP" | "BIRP" | "DAP">("SOAP");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // ROI Calculations
  const hoursSavedPerWeek = (sessionsPerWeek * 15) / 60; // 15 mins saved per note
  const hoursSavedPerMonth = Math.round(hoursSavedPerWeek * 4.33);
  const monthlyValueReclaimed = Math.round(hoursSavedPerMonth * hourlyRate);
  const annualValueReclaimed = monthlyValueReclaimed * 12;
  const subscriptionCost = billingCycle === "monthly" ? 29 : 24;
  const roiMultiplier = Math.round(monthlyValueReclaimed / subscriptionCost);

  const handleSubscribe = async () => {
    if (!clinicianEmail) {
      window.location.href = "/login?mode=signup";
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize checkout");
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Billing failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const sampleNotes = {
    SOAP: `S (Subjective): Patient reports persistent anxiety (GAD-7: 14, Moderate) prior to work presentations. Sleep disrupted (5 hrs/night).\nO (Objective): Client appeared alert, appropriate affect, fidgeting with hands. Logged 3 panic episodes this week.\nA (Assessment): Generalized Anxiety Disorder (ICD-10 F41.1). Responding moderately to Cognitive Reframing techniques.\nP (Plan): Continue bi-weekly CBT. Complete thought logs daily. Target GAD-7 score < 8 by week 6.`,
    BIRP: `B (Behavior): Client arrived on time, reported 3 intrusive panic attacks. Completed assigned diaphragmatic breathing logs.\nI (Intervention): Practiced cognitive restructuring for catastrophic thoughts; reviewed GAD-7 baseline trends.\nR (Response): Client successfully identified 2 cognitive distortions and reported anxiety reduction from 8/10 to 4/10 in-session.\nP (Plan): Client to execute 5-4-3-2-1 grounding technique during panic spikes before next session.`,
    DAP: `D (Data): PHQ-9 score 12 (Moderate). Patient discussed feeling overwhelmed by caregiving duties for aging parent.\nA (Assessment): Adjustment Disorder with Depressed Mood. High willingness to implement behavioral activation strategy.\nP (Plan): Schedule 30-minute daily self-care breaks. Re-evaluate PHQ-9 score in 14 days.`,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
      </div>

      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-teal-500/20">
              K
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">Kusco</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Clinician AI
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-teal-400 transition-colors">
              Features
            </a>
            <a href="#roi-calculator" className="hover:text-teal-400 transition-colors">
              ROI Calculator
            </a>
            <a href="#pricing" className="hover:text-teal-400 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-teal-400 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {clinicianEmail ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400 hidden sm:inline">{clinicianEmail}</span>
                <Link
                  href="/pricing"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-500 text-slate-950 hover:bg-teal-400 transition-all shadow-md shadow-teal-500/20"
                >
                  Manage Subscription
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleSubscribe}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-sky-500 text-slate-950 hover:from-teal-400 hover:to-sky-400 transition-all shadow-lg shadow-teal-500/25 cursor-pointer"
                >
                  Start $29/mo Pro Trial
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
            </span>
            <span>Powered by Gemini 2.0 AI & Neon Serverless Vault</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Reclaim <span className="gradient-text">10+ Hours Every Week</span>. Write Audit-Proof
            Notes in 30 Seconds.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal">
            Kusco is the AI clinical co-pilot built specifically for mental health professionals.
            Instantly transform raw transcripts into structured{" "}
            <span className="text-teal-300 font-medium">SOAP, BIRP, and DAP notes</span> while
            tracking PHQ-9/GAD-7 progress automatically.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleSubscribe}
              disabled={checkoutLoading}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-teal-400 via-teal-500 to-sky-500 text-slate-950 hover:opacity-95 transition-all shadow-xl shadow-teal-500/30 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{checkoutLoading ? "Redirecting..." : "Start Kusco Pro - $29/mo"}</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
            <a
              href="#roi-calculator"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-xl glass-card text-slate-200 hover:text-white hover:border-teal-500/40 transition-all flex items-center justify-center space-x-2"
            >
              <span>Calculate Your ROI</span>
            </a>
          </div>

          {checkoutError && (
            <div className="mt-4 text-sm text-red-400 bg-red-950/40 border border-red-500/30 rounded-lg p-2 max-w-md mx-auto">
              {checkoutError}
            </div>
          )}

          {/* Social Proof Badges */}
          <div className="mt-12 pt-8 border-t border-slate-800/60 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-400 text-xs font-medium">
            <div className="flex items-center justify-center space-x-2 glass-panel py-3 px-4 rounded-xl">
              <span className="text-teal-400">🛡️</span>
              <span>HIPAA-Ready Vault</span>
            </div>
            <div className="flex items-center justify-center space-x-2 glass-panel py-3 px-4 rounded-xl">
              <span className="text-sky-400">🔐</span>
              <span>256-Bit AES Encryption</span>
            </div>
            <div className="flex items-center justify-center space-x-2 glass-panel py-3 px-4 rounded-xl">
              <span className="text-indigo-400">⏱️</span>
              <span>30-Sec Note Generation</span>
            </div>
            <div className="flex items-center justify-center space-x-2 glass-panel py-3 px-4 rounded-xl">
              <span className="text-teal-400">📊</span>
              <span>PHQ-9 / GAD-7 Tracking</span>
            </div>
          </div>

          {/* Live Interactive Note Format Switcher Preview */}
          <div className="mt-14 max-w-4xl mx-auto glass-panel rounded-2xl p-6 border border-slate-800 text-left shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">
                  Kusco AI Clinical Editor v2.4
                </span>
              </div>
              <div className="flex space-x-2">
                {(["SOAP", "BIRP", "DAP"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab} Note
                  </button>
                ))}
              </div>
            </div>

            <pre className="font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              {sampleNotes[activeTab]}
            </pre>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center text-teal-400">
                <span className="inline-block w-2 h-2 rounded-full bg-teal-400 mr-2 animate-pulse" />
                Gemini 2.0 Context Match: 99.4%
              </span>
              <span>Formatted in 0.4 seconds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Benefit Grid */}
      <section id="features" className="py-16 md:py-24 relative z-10 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-teal-400 mb-2">
              Built for Modern Clinicians
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything You Need to Eliminate Documentation Pajama Time
            </p>
            <p className="mt-4 text-slate-400 text-base">
              Kusco combines clinical context intelligence, automated survey tracking, and statutory
              billing compliance in one seamlessly fast platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-2xl text-teal-400 mb-6">
                  📝
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Multi-Format Note Generation</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Generate structured SOAP, BIRP, DAP, and therapy summaries from voice transcripts
                  or rapid bullet points in under 30 seconds.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-teal-400 flex items-center">
                <span>Save 15 minutes per session</span>
                <span className="ml-1">→</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-2xl text-sky-400 mb-6">
                  🧠
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Patient Context Memory Bank</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  AI continuous memory remembers past session topics, treatment goals, and
                  diagnostic markers so you never start from a blank page.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-sky-400 flex items-center">
                <span>Continuous multi-session context</span>
                <span className="ml-1">→</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl text-indigo-400 mb-6">
                  📊
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Standardized Survey Suite</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Track longitudinal score progression for GAD-7, PHQ-9, and C-SSRS assessments with
                  visual trend graphs for insurance reviews.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-indigo-400 flex items-center">
                <span>Audit-proof survey telemetry</span>
                <span className="ml-1">→</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-2xl text-teal-400 mb-6">
                  🔍
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Diagnostic Match & Keyword Engine
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Automatic keyword frequency analysis and DSM-5 diagnostic indicator extraction
                  based on session dialogue evidence.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-teal-400 flex items-center">
                <span>Risk indicator highlighting</span>
                <span className="ml-1">→</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-2xl text-sky-400 mb-6">
                  🎯
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Interactive Goal & Metric Tracker
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Define patient treatment milestones with target completion metrics, deadline
                  tracking, and status badges.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-sky-400 flex items-center">
                <span>Outcome-focused planning</span>
                <span className="ml-1">→</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl text-indigo-400 mb-6">
                  🛡️
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Neon Cloud Vault & Tenant Isolation
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Every clinician's patient records are securely partitioned with `kusco_` schema
                  scoping, encrypted session tokens, and automated backups.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-semibold text-indigo-400 flex items-center">
                <span>Enterprise grade security</span>
                <span className="ml-1">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section
        id="roi-calculator"
        className="py-16 md:py-24 relative z-10 glass-panel border-t border-b border-slate-800/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400 mb-2 block">
              Interactive ROI Calculator
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              See How Much Time & Revenue Kusco Saves You
            </h2>
            <p className="mt-3 text-slate-400 text-base">
              Adjust your average client volume and billable hourly rate below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Input Controls */}
            <div className="lg:col-span-6 glass-card rounded-2xl p-8 border border-slate-800 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="sessions-slider" className="text-sm font-semibold text-slate-200">
                    Client Sessions Per Week
                  </label>
                  <span className="text-lg font-bold text-teal-400">
                    {sessionsPerWeek} sessions
                  </span>
                </div>
                <input
                  id="sessions-slider"
                  type="range"
                  min={5}
                  max={50}
                  step={1}
                  value={sessionsPerWeek}
                  onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>5 sessions</span>
                  <span>50 sessions</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="rate-slider" className="text-sm font-semibold text-slate-200">
                    Billable Hourly Rate ($)
                  </label>
                  <span className="text-lg font-bold text-sky-400">${hourlyRate}/hr</span>
                </div>
                <input
                  id="rate-slider"
                  type="range"
                  min={50}
                  max={300}
                  step={10}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>$50/hr</span>
                  <span>$300/hr</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                * Based on conservative 15-minute documentation time savings per session compared to
                manual note writing.
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="lg:col-span-6 glass-panel rounded-2xl p-8 border border-teal-500/30 glow-teal flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wide">
                  Calculated Monthly ROI Impact
                </span>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block">Hours Reclaimed</span>
                    <span className="text-2xl font-extrabold text-white mt-1 block">
                      {hoursSavedPerMonth} hrs/mo
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block">Value Reclaimed</span>
                    <span className="text-2xl font-extrabold text-teal-400 mt-1 block">
                      ${monthlyValueReclaimed.toLocaleString()}/mo
                    </span>
                  </div>
                </div>

                <div className="mt-4 bg-slate-900/90 p-5 rounded-xl border border-teal-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Net ROI Multiplier</span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                      {roiMultiplier}x Return
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Annual Revenue Value</span>
                    <span className="text-lg font-bold text-white">
                      ${annualValueReclaimed.toLocaleString()}/yr
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={checkoutLoading}
                className="w-full py-3.5 text-sm font-bold rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 text-slate-950 hover:from-teal-400 hover:to-sky-400 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                Unlock {roiMultiplier}x ROI – Subscribe for $29/mo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-16 md:py-24 relative z-10 border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Why Mental Health Clinicians Choose Kusco
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              Comparing standard workflow options for independent clinical practices.
            </p>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Capability</th>
                  <th className="py-4 px-4 text-center">Manual Notes</th>
                  <th className="py-4 px-4 text-center">Generic AI</th>
                  <th className="py-4 px-6 text-center text-teal-400 bg-teal-500/10">
                    Kusco Clinician Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-4 px-6 font-medium text-white">SOAP / BIRP / DAP Formats</td>
                  <td className="py-4 px-4 text-center text-red-400">Manual (20 min)</td>
                  <td className="py-4 px-4 text-center text-yellow-400">Generic Prompting</td>
                  <td className="py-4 px-6 text-center text-teal-400 font-bold bg-teal-500/5">
                    Instant (30 sec)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Multi-Session Context Memory</td>
                  <td className="py-4 px-4 text-center text-red-400">❌ Memory dependent</td>
                  <td className="py-4 px-4 text-center text-red-400">❌ No clinical memory</td>
                  <td className="py-4 px-6 text-center text-teal-400 font-bold bg-teal-500/5">
                    ✓ Continuous AI Context
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">PHQ-9 & GAD-7 Telemetry</td>
                  <td className="py-4 px-4 text-center text-yellow-400">Paper scoring</td>
                  <td className="py-4 px-4 text-center text-red-400">❌ Not available</td>
                  <td className="py-4 px-6 text-center text-teal-400 font-bold bg-teal-500/5">
                    ✓ Automated Visual Graphs
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">DSM-5 Keyword Extraction</td>
                  <td className="py-4 px-4 text-center text-red-400">❌ None</td>
                  <td className="py-4 px-4 text-center text-yellow-400">Basic keywords</td>
                  <td className="py-4 px-6 text-center text-teal-400 font-bold bg-teal-500/5">
                    ✓ Evidence-matched tags
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">HIPAA Tenant Isolation</td>
                  <td className="py-4 px-4 text-center text-slate-400">Physical paper</td>
                  <td className="py-4 px-4 text-center text-red-400">⚠️ Risk of data leakage</td>
                  <td className="py-4 px-6 text-center text-teal-400 font-bold bg-teal-500/5">
                    ✓ Isolated Neon PostgreSQL
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400 mb-2 block">
              Simple, Transparent Billing
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              One Price. Unlimited Clinical Productivity.
            </h2>
            <p className="mt-4 text-slate-400 text-base">
              No hidden fees, no credit caps, and no tiered restrictions.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 inline-flex items-center p-1.5 rounded-xl glass-panel border border-slate-800">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  billingCycle === "annual"
                    ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-sky-400/30 text-sky-200 text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Single Focused Pricing Card */}
          <div className="max-w-lg mx-auto glass-panel rounded-3xl p-8 sm:p-10 border border-teal-500/40 glow-teal relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-teal-500 to-sky-500 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
              Most Popular Choice
            </div>

            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block mb-2">
              Kusco Clinician Pro
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-black text-white">
                ${billingCycle === "monthly" ? "29" : "24"}
              </span>
              <span className="text-slate-400 font-semibold text-lg">/ month</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {billingCycle === "annual"
                ? "Billed annually as $288/year (2 months free)"
                : "Billed monthly. Cancel anytime."}
            </p>

            <ul className="mt-8 space-y-4 text-sm text-slate-200">
              <li className="flex items-center space-x-3">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span>Unlimited SOAP, BIRP & DAP Note Generation</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span>Gemini 2.0 Patient Memory Context Engine</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span>PHQ-9, GAD-7 & C-SSRS Survey Score Telemetry</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span>DSM-5 Diagnostic Match & Keyword Extraction</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span>Treatment Goals Milestone Manager</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span>HIPAA-Ready Isolated Neon PostgreSQL Storage</span>
              </li>
            </ul>

            <div className="mt-8">
              <button
                onClick={handleSubscribe}
                disabled={checkoutLoading}
                className="w-full py-4 text-base font-bold rounded-xl bg-gradient-to-r from-teal-400 via-teal-500 to-sky-500 text-slate-950 hover:opacity-95 transition-all shadow-xl shadow-teal-500/25 cursor-pointer"
              >
                {checkoutLoading ? "Initializing Checkout..." : "Subscribe Now - $29/mo"}
              </button>

              <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                <span>🔒 Secure checkout processed via Stripe</span>
                <span>•</span>
                <span>Instant Activation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="py-16 md:py-24 relative z-10 glass-panel border-t border-slate-800/60"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 mt-2 text-sm">Everything you need to know about Kusco.</p>
          </div>

          <div className="space-y-4">
            <div className="glass-card rounded-xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-2">Is Kusco HIPAA compliant?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Yes. All patient records are strictly isolated using tenant schema scoping (`kusco_`
                tables) on Neon Serverless PostgreSQL with 256-bit encryption in transit and at
                rest.
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-2">
                How fast are SOAP notes generated?
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Kusco leverages Google Gemini 2.0 Flash to process session transcripts or bullet
                notes in under 0.5 seconds, saving an average of 15 minutes per client session.
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-2">
                Can I cancel my subscription at any time?
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Absolutely. Manage your subscription or cancel anytime with 1-click inside the
                Stripe billing portal linked directly from your clinician workspace settings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800/80 text-slate-500 text-xs text-center z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs">
              K
            </div>
            <span className="font-bold text-slate-300">Kusco Portfolio Suite</span>
          </div>
          <p>
            © {new Date().getFullYear()} McMillan General Services. All rights reserved. Designed
            for healthcare professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}
