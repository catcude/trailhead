# Security & privacy — living checklist

Users are assumed to be minors. This file tracks the non-negotiables from
`docs/plans/scaffolding-plan.md` §5 against current reality. Update it in the
same PR as any security-relevant change.

| Item | Status | Where |
|---|---|---|
| RLS on every table, enabled in the migration that creates it | ✅ (all 11 tables) | `supabase/migrations/` |
| Automated RLS policy tests (cross-user + anon must fail) | ✅ CI `rls` job (local Supabase stack); also verified against Postgres 16 with an auth shim | `tests/rls/policies.test.ts` |
| No parent/teacher read path into student data | ✅ by construction (no such policy exists) | migrations |
| Data minimization at signup (email only; role + display name at onboarding) | ✅ | `app/auth/`, `app/(app)/onboarding/` |
| 13+ age attestation + parental-consent slot | ⬜ M1 onboarding (OQ4 — legal input needed) | — |
| Safety layer v1 (lexicon before any LLM call, authored crisis node) | ⬜ M1 stubs / M2 v1 | planned: `lib/llm/safety.ts` |
| Non-identifiable safety telemetry (no user_id, no text) | ⬜ M2 (`safety_events`) | planned migration 0003 |
| No ad tracking / third-party analytics / data sale | ✅ (nothing is loaded; CSP blocks drift) | `next.config.ts` |
| Server-only secrets never `NEXT_PUBLIC_` | ✅ | `.env.example` |
| Dependency audit + Dependabot | ✅ | `.github/workflows/ci.yml`, `.github/dependabot.yml` |
| Security headers (CSP, HSTS, XFO DENY, Referrer-Policy, Permissions-Policy) | ✅ | `next.config.ts` |
| Nonce-based CSP (drop `unsafe-inline`) | ⬜ backlog | `next.config.ts` |
| Rate limiting on `/api/checkin` | ✅ Postgres `check_rate_limit()` RPC (security definer; authenticated-only; counters table locked by policy-less RLS) + in-memory per-IP layer | migration 0002, `lib/utils/rate-limit.ts` |
| Stripe webhook signature verification | ⬜ M2 | planned: `app/api/webhooks/stripe/` |
| LLM data hygiene (session context only; no-training terms) | ⬜ M2 (OQ1) | planned: `lib/llm/provider.ts` |
| Branch protection on `main` with required CI checks | ⬜ repo setting — see `docs/SETUP.md` | GitHub |

Notes:
- `role` on `profiles` is self-descriptive (user-chosen at onboarding, PRD
  §6.1), not a permission tier. If role ever gates privileged behavior, move
  role changes server-side and re-review the RLS policies.
- Middleware fails closed: with Supabase unconfigured, protected paths
  redirect to sign-in rather than rendering.
