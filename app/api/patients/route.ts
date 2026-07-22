import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionClinician } from "@/lib/auth";
import { db } from "@/lib/db";
import { patients } from "@/lib/db/schema";

export async function GET(_request: NextRequest) {
  try {
    const clinician = await getSessionClinician();
    if (!clinician) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clinicianPatients = await db
      .select()
      .from(patients)
      .where(eq(patients.clinicianId, clinician.id))
      .orderBy(desc(patients.createdAt));

    return NextResponse.json(clinicianPatients, { status: 200 });
  } catch (error) {
    console.error("GET patients error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const clinician = await getSessionClinician();
    if (!clinician) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
    }

    const [newPatient] = await db
      .insert(patients)
      .values({
        name: name.trim(),
        clinicianId: clinician.id,
      })
      .returning();

    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error("POST patient error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
