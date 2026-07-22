import { redirect } from "next/navigation";
import { getSessionClinician } from "@/lib/auth";
import SubscribeButton from "./SubscribeButton";

export default async function PricingPage() {
  const clinician = await getSessionClinician();

  if (!clinician) {
    redirect("/login");
  }

  // If already active, redirect back to dashboard
  if (clinician.subscriptionStatus === "active") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-4xl font-extrabold text-teal-800 tracking-tight">
          Kusco Clinician Pro
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          Unleash secure clinician-AI notes, goal tracking, and interactive mental health chats.
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-200 text-center flex flex-col justify-between">
        <div>
          <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800 uppercase tracking-wide mb-4">
            Clinician Access
          </span>
          <h2 className="text-2xl font-bold text-slate-800">Pro Plan</h2>
          <div className="mt-4 flex items-center justify-center text-slate-800">
            <span className="text-5xl font-extrabold tracking-tight">$29</span>
            <span className="ml-1 text-xl font-semibold text-slate-500">/mo</span>
          </div>

          <ul className="mt-8 space-y-4 text-left text-slate-600">
            <li className="flex items-center">
              <span className="mr-2 text-teal-600 font-bold">✓</span>
              Secure patient-specific AI assistant chat
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-teal-600 font-bold">✓</span>
              Generate formatted SOAP, BIRP, DAP, and Basic notes
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-teal-600 font-bold">✓</span>
              Patient management dashboard
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-teal-600 font-bold">✓</span>
              Track goals, surveys, and diagnose metrics
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-teal-600 font-bold">✓</span>
              HIPAA-ready secure cloud database storage
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <SubscribeButton />

          <div className="mt-4 text-xs text-slate-400">
            Secure billing processed by Stripe. Cancel anytime.
          </div>
        </div>
      </div>
    </div>
  );
}
