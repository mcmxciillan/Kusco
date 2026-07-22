import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSessionClinician } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // Use default API version configured in the stripe SDK
});

export async function POST(_request: NextRequest) {
  try {
    const clinician = await getSessionClinician();
    if (!clinician) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!clinician.stripeCustomerId) {
      return NextResponse.json({ error: "Missing stripe customer ID" }, { status: 400 });
    }

    // 1. Resolve or create product & price dynamically
    let priceId = "";

    // Search for existing price or product
    const products = await stripe.products.list({ limit: 10 });
    const existingProduct = products.data.find((p) => p.name === "Kusco Clinician AI Assistant");

    if (existingProduct) {
      const prices = await stripe.prices.list({ product: existingProduct.id, limit: 1 });
      if (prices.data.length > 0) {
        priceId = prices.data[0].id;
      }
    }

    if (!priceId) {
      // Create product
      const product = await stripe.products.create({
        name: "Kusco Clinician AI Assistant",
        description: "Secure clinician-AI patient notes, chat, and insights ($29/month)",
      });
      // Create monthly price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 2900, // $29.00
        currency: "usd",
        recurring: {
          interval: "month",
        },
      });
      priceId = price.id;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // 2. Create subscription checkout session
    const session = await stripe.checkout.sessions.create({
      customer: clinician.stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/?billing=success`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        clinicianId: String(clinician.id),
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Billing checkout error:", error);
    return NextResponse.json({ error: "Failed to initialize billing session" }, { status: 500 });
  }
}
