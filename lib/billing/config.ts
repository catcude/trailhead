/**
 * Freemium config (PRD §6.5, D2). The free tier is genuinely useful — not a
 * teaser. Placeholder accepted by Cat: FREE = 1 full check-in/day + unlimited
 * Mini Resets; price is TBD and lives entirely in env, so no number is baked
 * into code.
 */
export const FREE_DAILY_CHECKINS = 1;

/** Subscription statuses that grant paid entitlement. */
export const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export function stripePriceId(): string | undefined {
  return process.env.STRIPE_PRICE_ID;
}

export function isBillingConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
