import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { clinicians } from "@/lib/db/schema";
import { verifyJwt } from "./jwt";

export type SessionClinician = typeof clinicians.$inferSelect;

export async function getSessionClinician(): Promise<SessionClinician | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kusco_token")?.value;
    if (!token) return null;

    const payload = verifyJwt(token);
    if (!payload?.id) return null;

    const [clinician] = await db
      .select()
      .from(clinicians)
      .where(eq(clinicians.id, payload.id as number))
      .limit(1);

    return clinician || null;
  } catch (error) {
    console.error("Error getting session clinician:", error);
    return null;
  }
}
