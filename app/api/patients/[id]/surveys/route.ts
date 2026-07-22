import { and, desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionClinician } from "@/lib/auth";
import { db } from "@/lib/db";
import { patients, surveys } from "@/lib/db/schema";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clinician = await getSessionClinician();
    if (!clinician) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const patientId = Number.parseInt(id, 10);

    const patientSurveys = await db
      .select()
      .from(surveys)
      .where(eq(surveys.patientId, patientId))
      .orderBy(desc(surveys.timestamp));

    return NextResponse.json(patientSurveys, { status: 200 });
  } catch (error) {
    console.error("GET surveys error:", error);
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
    const { surveyType, responses, totalScore, notes: surveyNotes } = body;

    if (!surveyType || !responses || totalScore === undefined) {
      return NextResponse.json(
        { error: "Survey type, responses, and score are required" },
        { status: 400 },
      );
    }

    const [newSurvey] = await db
      .insert(surveys)
      .values({
        patientId,
        surveyType,
        responses,
        totalScore,
        notes: surveyNotes || null,
      })
      .returning();

    return NextResponse.json(newSurvey, { status: 201 });
  } catch (error) {
    console.error("POST survey error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
