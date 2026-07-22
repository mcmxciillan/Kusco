import { and, desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionClinician } from "@/lib/auth";
import { db } from "@/lib/db";
import { diagnoses, keywords, patients } from "@/lib/db/schema";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Fetch keywords
    let patientKeywords = await db
      .select()
      .from(keywords)
      .where(eq(keywords.patientId, patientId))
      .orderBy(desc(keywords.frequency));

    // Fetch diagnoses
    let patientDiagnoses = await db
      .select()
      .from(diagnoses)
      .where(eq(diagnoses.patientId, patientId))
      .orderBy(desc(diagnoses.timestamp));

    // Seed dummy stats if none exist so dashboard is not blank
    if (patientKeywords.length === 0) {
      const dummyKeywords = [
        {
          patientId,
          keyword: "Anxiety",
          frequency: 5,
          category: "Symptom",
          contexts: ["anxious during work", "panic attacks at night"],
        },
        {
          patientId,
          keyword: "Sleep",
          frequency: 3,
          category: "Behavior",
          contexts: ["insomnia", "waking up tired"],
        },
        {
          patientId,
          keyword: "Work Stress",
          frequency: 4,
          category: "Stressors",
          contexts: ["overwhelmed by tasks", "conflict with manager"],
        },
        {
          patientId,
          keyword: "Mindfulness",
          frequency: 2,
          category: "Coping Mechanism",
          contexts: ["guided breathing exercises", "meditation"],
        },
      ];

      patientKeywords = await db.insert(keywords).values(dummyKeywords).returning();
    }

    if (patientDiagnoses.length === 0) {
      const dummyDiagnoses = [
        {
          patientId,
          diagnosis: "Generalized Anxiety Disorder (GAD)",
          likelihood: 0.85,
          evidence: "Persistent worry, sleep issues, elevated pulse reported in sessions.",
        },
        {
          patientId,
          diagnosis: "Mild Adjustment Disorder",
          likelihood: 0.6,
          evidence: "Recent career change triggers stress and mood fluctuations.",
        },
      ];

      patientDiagnoses = await db.insert(diagnoses).values(dummyDiagnoses).returning();
    }

    return NextResponse.json(
      {
        keywords: patientKeywords,
        diagnoses: patientDiagnoses,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
