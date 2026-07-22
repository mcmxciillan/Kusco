import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { clinicians } from "@/lib/db/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  // Use default API version configured in the stripe SDK
});

export async function POST(request: NextRequest) {
  const { STRIPE_WEBHOOK_SECRET } = process.env;
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    if (!STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errMessage}` }, { status: 400 });
  }

  const subscriptionEvents = [
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ];

  if (subscriptionEvents.includes(event.type)) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const status = subscription.status;

    // Set clinician status based on active or inactive subscription status
    const isSubscriptionActive = status === "active";
    const statusValue = isSubscriptionActive ? "active" : "inactive";

    await db
      .update(clinicians)
      .set({
        subscriptionStatus: statusValue,
        stripeSubscriptionId: subscription.id,
      })
      .where(eq(clinicians.stripeCustomerId, customerId));

    console.log(`Clinician with Stripe Customer ${customerId} updated to ${statusValue}.`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
