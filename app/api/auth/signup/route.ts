import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { clinicians } from "@/lib/db/schema";
import { signJwt } from "@/lib/jwt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // Use default API version configured in the stripe SDK
});

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Check if clinician already exists
    const [existing] = await db
      .select()
      .from(clinicians)
      .where(eq(clinicians.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Account with this email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Stripe Customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        app: "kusco",
      },
    });

    // Create clinician in DB
    const [newClinician] = await db
      .insert(clinicians)
      .values({
        email,
        password: hashedPassword,
        subscriptionStatus: "inactive",
        stripeCustomerId: customer.id,
      })
      .returning();

    if (!newClinician) {
      throw new Error("Failed to insert clinician record");
    }

    // Generate JWT
    const token = signJwt({ id: newClinician.id, email: newClinician.email });

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
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong during signup" }, { status: 500 });
  }
}
