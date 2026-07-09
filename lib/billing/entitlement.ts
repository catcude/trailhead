import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVE_STATUSES, FREE_DAILY_CHECKINS } from "./config";

/**
 * Entitlement logic (WS7). Free tier = FREE_DAILY_CHECKINS full check-ins/day
 * plus unlimited Mini Resets (which happen inside an existing session, so they
 * never count here — only starting a NEW session does). Paid lifts the daily
 * limit. Pure enough to unit-test with a mocked client.
 */

/** True if the user has an active/trialing subscription that hasn't lapsed. */
export async function isSubscribed(
  supabase: SupabaseClient,
  now: Date = new Date(),
): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, current_period_end");
  for (const row of data ?? []) {
    const r = row as { status: string; current_period_end: string | null };
    if (!ACTIVE_STATUSES.has(r.status)) continue;
    if (!r.current_period_end) return true;
    if (new Date(r.current_period_end) >= now) return true;
  }
  return false;
}

/** Count of full check-ins (sessions) the user started today (UTC). */
export async function checkinsToday(
  supabase: SupabaseClient,
  userId: string,
  now: Date = new Date(),
): Promise<number> {
  const dayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
  const { count } = await supabase
    .from("chat_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("started_at", dayStart);
  return count ?? 0;
}

/**
 * Whether the user may start a NEW full check-in right now. Subscribers always
 * may; free users may until they hit the daily limit.
 */
export async function canStartCheckin(
  supabase: SupabaseClient,
  userId: string,
  now: Date = new Date(),
): Promise<boolean> {
  if (await isSubscribed(supabase, now)) return true;
  return (await checkinsToday(supabase, userId, now)) < FREE_DAILY_CHECKINS;
}
