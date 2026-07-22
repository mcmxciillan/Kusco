import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSessionClinician } from "@/lib/auth";
import { db } from "@/lib/db";
import { patients } from "@/lib/db/schema";
import Dashboard from "./Dashboard";

export default async function HomePage() {
  const clinician = await getSessionClinician();

  if (!clinician) {
    redirect("/login");
  }

  if (clinician.subscriptionStatus !== "active") {
    redirect("/pricing");
  }

  // Fetch initial patients list
  const initialPatients = await db
    .select()
    .from(patients)
    .where(eq(patients.clinicianId, clinician.id))
    .orderBy(desc(patients.createdAt));

  return <Dashboard clinicianEmail={clinician.email} initialPatients={initialPatients} />;
}
