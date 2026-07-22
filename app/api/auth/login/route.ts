import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clinicians } from "@/lib/db/schema";
import { signJwt } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Find clinician
    const [clinician] = await db
      .select()
      .from(clinicians)
      .where(eq(clinicians.email, email))
      .limit(1);

    if (!clinician) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, clinician.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Generate JWT
    const token = signJwt({ id: clinician.id, email: clinician.email });

    // Set cookie
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.set("kusco_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Something went wrong during login" }, { status: 500 });
  }
}
