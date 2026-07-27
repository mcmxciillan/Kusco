import { desc, eq } from "drizzle-orm";
import { getSessionClinician } from "@/lib/auth";
import { db } from "@/lib/db";
import { patients } from "@/lib/db/schema";
import LandingPage from "./components/LandingPage";
import Dashboard from "./Dashboard";

export default async function HomePage() {
  const clinician = await getSessionClinician();

  if (clinician?.subscriptionStatus !== "active") {
    return <LandingPage clinicianEmail={clinician?.email} />;
  }

  // Fetch initial patients list
  const initialPatients = await db
    .select()
    .from(patients)
    .where(eq(patients.clinicianId, clinician.id))
    .orderBy(desc(patients.createdAt));

  return <Dashboard clinicianEmail={clinician.email} initialPatients={initialPatients} />;
}
