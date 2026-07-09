-- Table privileges for the PostgREST-facing `authenticated` role.
--
-- RLS (enabled with owner-only policies on every table in the earlier
-- migrations) remains the row-level gate. These grants are the separate,
-- table-level privilege PostgREST requires before RLS is even consulted:
-- without them, an authenticated request gets "permission denied for table …"
-- outright. Older Supabase local stacks auto-granted migration-created tables;
-- newer ones (CI `supabase/setup-cli` v3) do not, so the grants are explicit
-- here. `anon` is granted nothing — this is owner-only student data.
--
-- Deliberately omitted: `rate_limit_counters` and `safety_events`. They stay
-- reachable ONLY through their security-definer RPCs (`check_rate_limit`,
-- `log_safety_event`); no table grant keeps direct client access denied. The
-- billing tables get SELECT only — their writes happen via the service role in
-- the Stripe webhook, never from a client.
--
-- NOTE for future migrations: a new table needs its own grant here (or inline).
-- We intentionally do NOT use a blanket `alter default privileges`, so that
-- RPC-only tables like the two above keep getting no grant by default.

grant select, insert, update, delete on table
  public.profiles,
  public.chat_sessions,
  public.chat_messages,
  public.reflections,
  public.aha_moments,
  public.habits,
  public.habit_checks,
  public.goals,
  public.weekly_horizons,
  public.personality_profiles
to authenticated;

-- Billing: owner-read only. Writes are service-role (webhook) — no write grant.
grant select on table public.billing_customers, public.subscriptions
to authenticated;
