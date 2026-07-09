import Stripe from "stripe";
import { stripePriceId } from "./config";

/**
 * Stripe SDK boundary — the ONLY file that imports `stripe` (grep-verified in
 * tests), mirroring the LLM-layer rule. Everything billing-related routes
 * through here.
 */
let cached: Stripe | null = null;
function stripe(): Stripe {
  if (!cached) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    cached = new Stripe(key);
  }
  return cached;
}

/** Checkout for the paid plan. `client_reference_id` ties the session to the user. */
export async function createCheckoutSession(params: {
  userId: string;
  email?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string | null }> {
  const price = stripePriceId();
  if (!price) throw new Error("STRIPE_PRICE_ID is not set");
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    client_reference_id: params.userId,
    customer_email: params.email,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
  return { url: session.url };
}

/** Customer portal — this is the "cancel in two taps" surface (PRD §9). */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  const session = await stripe().billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
  return { url: session.url };
}

/** Verify + parse a webhook payload. Throws if the signature is invalid. */
export function constructWebhookEvent(
  rawBody: string,
  signature: string,
  secret: string,
): Stripe.Event {
  return stripe().webhooks.constructEvent(rawBody, signature, secret);
}
