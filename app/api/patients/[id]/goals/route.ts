import { and, desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionClinician } from "@/lib/auth";
import { db } from "@/lib/db";
import { goals, patients } from "@/lib/db/schema";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clinician = await getSessionClinician();
    if (!clinician) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const patientId = Number.parseInt(id, 10);

    const patientGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.patientId, patientId))
      .orderBy(desc(goals.createdAt));

    return NextResponse.json(patientGoals, { status: 200 });
  } catch (error) {
    console.error("GET goals error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clinician = await getSessionClinician();
    if (!clinician) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const patientId = Number.parseInt(id, 10);

    // Verify patient belongs to clinician
    const [patient] = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, patientId), eq(patients.clinicianId, clinician.id)))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const body = await request.json();
    const { description, metric, targetValue, currentValue, deadline } = body;

    if (!description?.trim()) {
      return NextResponse.json({ error: "Goal description is required" }, { status: 400 });
    }

    const [newGoal] = await db
      .insert(goals)
      .values({
        patientId,
        description: description.trim(),
        metric: metric?.trim() || null,
        targetValue: targetValue?.trim() || null,
        currentValue: currentValue?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        completed: 0,
      })
      .returning();

    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error("POST goal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
