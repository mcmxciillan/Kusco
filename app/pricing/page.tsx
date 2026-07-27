import { redirect } from "next/navigation";
import { getSessionClinician } from "@/lib/auth";
import LandingPage from "../components/LandingPage";

export default async function PricingPage() {
  const clinician = await getSessionClinician();

  if (!clinician) {
    redirect("/login");
  }

  // If already active, redirect back to dashboard
  if (clinician.subscriptionStatus === "active") {
    redirect("/");
  }

  return <LandingPage clinicianEmail={clinician.email} />;
}
