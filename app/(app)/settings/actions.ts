"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createCheckoutSession,
  createPortalSession,
} from "@/lib/billing/stripe";

async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function startCheckout() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const base = await origin();
  const { url } = await createCheckoutSession({
    userId: user.id,
    email: user.email ?? undefined,
    successUrl: `${base}/settings?upgraded=1`,
    cancelUrl: `${base}/settings`,
  });
  if (url) redirect(url);
  redirect("/settings");
}

/** The "cancel in two taps" path: settings → portal → cancel (PRD §9). */
export async function openPortal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const { data } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const customerId = (data as { stripe_customer_id: string } | null)
    ?.stripe_customer_id;
  if (!customerId) redirect("/settings");
  const base = await origin();
  const { url } = await createPortalSession({
    customerId,
    returnUrl: `${base}/settings`,
  });
  redirect(url);
}
