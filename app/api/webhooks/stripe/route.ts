import { NextResponse, type NextRequest } from "next/server";
import { constructWebhookEvent } from "@/lib/billing/stripe";
import { handleStripeEvent } from "@/lib/billing/webhook";

/**
 * Stripe webhook. Signature verification with STRIPE_WEBHOOK_SECRET is
 * MANDATORY — an unverified body is never processed. Handling is idempotent
 * (upsert-by-unique-key), so Stripe's retries are safe.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event;
  try {
    event = constructWebhookEvent(rawBody, signature, secret);
  } catch {
    // Bad signature or malformed payload — reject, never process.
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
  } catch {
    // Let Stripe retry on a transient write failure.
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
