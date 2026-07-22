import { GoogleGenAI } from "@google/genai";
import { and, asc, desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionClinician } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatHistory, notes, patients } from "@/lib/db/schema";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

const NOTE_PROMPTS: Record<string, string> = {
  SOAP: `Based on the conversation history: "{context}", generate a SOAP therapy note for the patient. Format it as:
**Subjective**: [Client’s reported symptoms, emotions, concerns]
**Objective**: [Observable data: appearance, symptoms, etc.]
**Assessment**: [Clinical synthesis of progress]
**Plan**: [Treatment plan, interventions, goals]
Provide only the formatted note, no additional commentary.
Respond from the perspective of a mental health clinician.`,
  BIRP: `Based on the conversation history: "{context}", generate a BIRP therapy note for the patient. Format it as:
**Behavior**: [Client’s presentation, actions, emotions]
**Intervention**: [Themes explored, interventions used]
**Response**: [Client’s response to interventions]
**Plan**: [Future session plans, treatment changes]
Provide only the formatted note, no additional commentary.
Respond from the perspective of a mental health clinician.`,
  DAP: `Based on the conversation history: "{context}", generate a DAP therapy note for the patient. Format it as:
**Data**: [Observable data: behavior, mood, symptoms]
**Assessment**: [Professional assessment, progress]
**Plan**: [Future session plans, treatment changes]
Provide only the formatted note, no additional commentary.
Respond from the perspective of a mental health clinician.`,
  Basic: `Based on the conversation history: "{context}", generate a Basic therapy note for the patient. Format it as:
**Presentation**: [Session location, client appearance]
**State**: [Emotional state, behaviors, functioning]
**Assessment**: [Results of any assessments]
**Themes**: [Topics discussed]
**Treatment**: [Interventions and client response]
**Progress**: [Developments, concerns, goals, homework]
Provide only the formatted note, no additional commentary.
Respond from the perspective of a mental health clinician.`,
};

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const clinician = await getSessionClinician();
    if (!clinician) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const patientId = Number.parseInt(id, 10);

    const patientNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.patientId, patientId))
      .orderBy(desc(notes.timestamp));

    return NextResponse.json(patientNotes, { status: 200 });
  } catch (error) {
    console.error("GET notes error:", error);
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
    const { action, noteType, content } = body;

    if (action === "generate") {
      if (!noteType || !NOTE_PROMPTS[noteType]) {
        return NextResponse.json({ error: "Valid note type is required" }, { status: 400 });
      }

      // Fetch chat history
      const history = await db
        .select()
        .from(chatHistory)
        .where(eq(chatHistory.patientId, patientId))
        .orderBy(asc(chatHistory.timestamp));

      const context = history
        .map((h) => `Clinician: ${h.userMessage}\nAI: ${h.modelResponse}`)
        .join("\n");

      const promptTemplate = NOTE_PROMPTS[noteType];
      const fullPrompt = promptTemplate.replace("{context}", context);

      let generatedNote = `Mock generated ${noteType} note. Please edit as necessary.`;

      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (apiKey && apiKey !== "dummy-key") {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: fullPrompt,
          });
          if (response.text) {
            generatedNote = response.text.trim();
          }
        } catch (geminiError) {
          console.error("Gemini Note API call failed:", geminiError);
        }
      }

      return NextResponse.json({ note: generatedNote }, { status: 200 });
    }

    if (action === "save") {
      if (!noteType || !content) {
        return NextResponse.json({ error: "Note type and content are required" }, { status: 400 });
      }

      const [newNote] = await db
        .insert(notes)
        .values({
          patientId,
          noteType,
          content,
        })
        .returning();

      return NextResponse.json(newNote, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST notes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
