import { GoogleGenAI } from "@google/genai";
import { and, asc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSessionClinician } from "@/lib/auth";
import { db } from "@/lib/db";
import { chatHistory, patients } from "@/lib/db/schema";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

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

    const history = await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.patientId, patientId))
      .orderBy(asc(chatHistory.timestamp));

    return NextResponse.json(history, { status: 200 });
  } catch (error) {
    console.error("GET chat error:", error);
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

    const { message } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Retrieve previous chat history to form context
    const previousHistory = await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.patientId, patientId))
      .orderBy(asc(chatHistory.timestamp));

    const systemInstruction = `You are an expert mental health assistant designed to support clinicians.
Your role is to provide concise, accurate, and empathetic responses to assist with patient care, based on the conversation history provided.
Deliver only the final response, tailored to the clinician’s query. Do not explain your thought process.`;

    const context = previousHistory
      .map((h) => `Clinician: ${h.userMessage}\nAI: ${h.modelResponse}`)
      .join("\n");

    const fullPrompt = `${systemInstruction}\n\nExisting Chat History:\n${context}\n\nClinician: ${message.trim()}\nAI:`;

    let modelResponse = "Mock AI clinical response (Gemini API key placeholder).";

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (apiKey && apiKey !== "dummy-key" && !apiKey.startsWith("AQ.")) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: fullPrompt,
        });
        if (response.text) {
          modelResponse = response.text.trim();
        }
      } catch (geminiError) {
        console.error("Gemini API call failed:", geminiError);
        // Fallback to placeholder/mock if Gemini throws an error
      }
    } else if (apiKey?.startsWith("AQ.")) {
      // In production/local if using pre-configured key
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: fullPrompt,
        });
        if (response.text) {
          modelResponse = response.text.trim();
        }
      } catch (geminiError) {
        console.error("Gemini API key call failed:", geminiError);
      }
    }

    // Save to DB
    const [inserted] = await db
      .insert(chatHistory)
      .values({
        patientId,
        userMessage: message.trim(),
        modelResponse,
      })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error("POST chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
