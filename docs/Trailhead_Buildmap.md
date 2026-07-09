# Trailhead Buildmap — Execution Map for Opus 4.8

**Purpose:** This file is the implementation-ready plan for every Trailhead milestone. It is written so an implementation pass (Opus 4.8) can execute it step by step without additional context. It was produced by a planning pass on 2026-07-07 after inspecting the full repo, the PRD, the brief, and all path/content documents.

**Source-of-truth order (when sources disagree, flag — never silently resolve):**
1. The repo itself (code, migrations, `content/`, tests) — what actually exists.
2. `docs/plans/scaffolding-plan.md` (approved) + this buildmap — how it gets built.
3. `docs/Trailhead_PRD.txt` — product requirements and acceptance intent.
4. `docs/Trailhead_Product_Brief.txt` — vision and voice.
5. `CLAUDE.md` — standing conventions (read it before every session; its rules are restated in the guidance section at the end of this file).

**Status at time of writing:**

| Milestone | Status |
|---|---|
| M0 — Live skeleton | ✅ Code complete on branch `claude/trailhead-scaffolding-plan-j36q96`; external provisioning pending (docs/SETUP.md) |
| M1 — Guidepost engine core | ✅ Code complete on the same branch; Cat's content approvals pending (`docs/content-review/m1-for-cat.md`) |
| M2 — Phase 1 complete (adaptivity, tools, safety v1, billing) | 📋 Planned below |
| M3 — Blue + Red behind flags, permeability, Red release gate | 📋 Planned below |
| M4 — Community & depth (PRD Phase 2) | 📋 Planned below (needs human review before execution) |
| M5 — Tutoring matching (PRD Phase 3) | 📋 Outlined below (requires a dedicated planning pass before execution) |

**Branch/PR state:** The M0/M1 application code (commits `818da96`…`97bcf77`) originated on `claude/trailhead-scaffolding-plan-j36q96` and was fast-forwarded onto `main` on 2026-07-07, so **`main` now contains the full application** alongside the plan docs and Cat's root `index.html` mockup. Continue day-to-day work on the feature branch and land it on `main` via fast-forward/PR; `main` and the branch tip should stay in sync.

---

## Decisions from Cat — 2026-07-08

Cat answered the open-questions page (`questions-for-cat.html`); her verbatim answers are checked in at `docs/content-review/cat-answers-2026-07-08.md`. This is the authoritative resolution log; milestones below reference these by ID (D1–D13). Where an answer was ambiguous or only partial, that is stated — **not** filled in by guessing.

- **D1 — AI provider + source-material knowledge base (was OQ1).** **Provider RESOLVED (Cat, 2026-07-08 follow-up): Anthropic Claude API** — wired in M2-WS1 (small/fast model default `claude-haiku-4-5`, `verbatim` as the guaranteed fallback; no key ⇒ verbatim, no user-facing error). Her longer-term direction: begin with the dialogue tree + verbatim words (as built), then **build a Supabase database from her source material that the AI draws on to answer and guide the user**, because "the dialogue tree as it is, is not complex enough." **KB DEFERRED (design-only):** Cat asked to provide the source material later, so the KB is **not built** in M2 — only designed. **FLAG (architecture):** the KB evolves Guidepost beyond today's "LLM only rephrases authored text / never invents flow" toward retrieval-grounded answering, and must preserve the non-negotiables (safety screen first, the state machine still owns flow, no fabricated dialogue, IP integrity). Design lives in `docs/plans/source-material-kb.md`; it is **gated on Cat + a safety/privacy review** before any build. **Still open:** the "API for the source material" / which documents; cost-latency at scale; how KB output is covered by the tone eval.
- **D2 — Pricing (was OQ6). RESOLVED (placeholder accepted):** free = 1 full check-in/day + unlimited Mini Resets; paid = unlimited check-ins + full dashboard + community + history. Price **TBD** (Cat sets later).
- **D3 — Crisis copy.** Confirmed intent: the trusted-adult step must **equip the user with scripts, tools, and guidance** to actually approach a trusted adult — not merely name one. **Still open / needs sign-off:** the exact wording of the intro and trusted-adult lines. Part of Cat's recorded answer was a voice-transcription garble ("Safe email to your farm… regal breakfast") — deliberately **not** interpreted here; re-ask for the exact lines. Boundary line + 988 + Crisis Text Line remain locked/verbatim.
- **D4 — Reflective-depth cap. RESOLVED:** cap = **3** probing questions, then a grounding reset. New requirement from Cat: the reset must be **non-dismissive and not abrupt** — no jarring tone shift. More layers to this part come later.
- **D5 — Red Path reframing + escalation basis.** Cat's key clarification: being on the Red Path does **not** by itself mean imminent danger — it means the user is **dysregulated and needs a nervous-system reset**. Users move between paths day-to-day; it is **not** a positive/negative build-up (someone can start Green and end Red, or vice-versa, depending on the day). The line between normal human dysregulation and "needs a medical professional" is defined by the **intensity, frequency, and duration** of Red-Path usage over time. The safety review should focus on defining that threshold. **Still open:** who runs the review + timing. **Privacy note (flagged):** any frequency/duration signal must be computed from the user's **own** owner-only session history and surfaced **only to them** — never to parents/teachers, never in identifiable safety telemetry (this is ordinary owner-only `chat_sessions` data, distinct from the identifier-free `safety_events` crisis log).
- **D6 — Entry router is 4-way; Yellow label rewritten. RESOLVED:** the opening question routes to **all four paths** by the user's state (not just Green/Yellow with Blue/Red hidden); the AI then responds to move the user toward regulation or to leverage the regulated state they're already in. Yellow entry label, in Cat's words: **"I know what I need to do or want to do, but I'm not sure how to start."** Green label left as drafted. Blue/Red remain flag-gated in the router until built (Blue) and safety-reviewed (Red) — the 4-way intent is the target once flags open.
- **D7 — Stage 1 opener (was G-G3). RESOLVED:** "What are 1–3 things at the top of your mind today?" — matches what is already implemented in `content/paths/green.ts`; no change needed.
- **D8 — Stage 4 tip (was G-G4). RESOLVED (new authored line):** **"We want to reach the flow state by aligning your goals and your actions."** Replaces the drafted `s4-align-day` tip. Content follow-up.
- **D9 — Quiz tone rubric (was OQ2). Basis RESOLVED:** tone shifts are driven by **Vanessa Van Edwards' communication-styles** material (built on the Big Five); Cat expects "we'll have the API for" it. **Still open:** the concrete A/B/C → communication-style → tone-adjustment mapping, and what the "API"/source actually is. Closely tied to D1 (the source-material store). Scoring stays stubbed / `FF_QUIZ_SCORING` off until the mapping exists.
- **D10 — Community home (was OQ5). RESOLVED:** build it **in-app**; adopt a **Skool-style forum format** (someone posts, others answer).
- **D11 — Community scope. RESOLVED (narrows the PRD):** the forum is limited to **parent and teacher accounts only** — questions, answers, and resources — with **no student↔student and no student↔adult** connection. **FLAG (PRD conflict):** PRD §6.4 described student/parent/teacher containers + overlap; Cat's decision supersedes and removes the student community entirely. **Still open:** whether the forum is free or paid, and who moderates it.
- **D12 — Consent/age (was OQ4). RESOLVED (posture accepted):** 13+ self-check + data minimization now; parental-consent step reserved for the school rollout.
- **D13 — Tutoring direction (M5). RESOLVED (direction):** anyone who wants to tutor must pass a **background check (criminal history)** against standards TBD; roll out first in a **small geographic area / contained group**, then scale.

**Applies to content/code (follow-up implementation pass — NOT done in this doc update):**
- Yellow router label → `content/router.ts` (D6), then `pnpm content:lock` + `content:` commit.
- Stage 4 tip line → `content/paths/green.ts` `s4-align-day` (D8), then re-lock.
- Depth-cap constant `= 3` + the non-dismissive/no-abrupt reset-tone requirement (D4) → M2-WS4.
- Trusted-adult "equip with scripts/tools/guidance" behavior (D3) → M2-WS4 safety, once Cat signs off the exact lines.
- Van Edwards communication-styles rubric (D9) → `lib/personality/scoring.ts` design, gated on the concrete mapping.
- (The scaffolding-plan OQ register in `docs/plans/scaffolding-plan.md` still shows these as open; sync it in a later pass.)

---

## Milestone 0 — Live skeleton (COMPLETE)

### 1. Milestone objective
Get a deployable, secure, CI-guarded application shell live-first: repo scaffold, design tokens, auth, landing page v0, and the full CI/CD pipeline — so every later milestone ships onto a working deployment rather than toward one.

### 2. Source grounding
Scaffolding plan §M0 (`docs/plans/scaffolding-plan.md`); PRD §5.1 (Patagonia design system), §6.1 (accounts/roles), §8 (mobile-first, accessibility); CLAUDE.md (project structure, code style, env vars); brief §Look & Feel.

### 3. Current state (what exists — reuse, do not rebuild)
- Next.js App Router + TypeScript strict + Tailwind v4, pnpm. Scripts: `dev`, `build`, `typecheck`, `lint`, `test`, `format`, `content:lock`.
- Design tokens: `app/globals.css` is the ONLY file allowed to contain raw hex (Patagonia palette as `@theme` tokens: `coral`, `cta`, `info`, `calm`, `depth`, `ink`, `sand`; WCAG pairings documented inline — note: white-on-`cta` passes AA only at large/bold sizes). Enforced by `scripts/check-tokens.mjs` in CI. Locked by `tests/tokens.test.ts`.
- UI primitives: `components/ui/{button,card,tip-box,auth-form,not-configured}.tsx`.
- Auth: `lib/supabase/{config,client,server,middleware,routes}.ts`; root `middleware.ts` protects `/dashboard`, `/checkin`, `/community`, `/settings`, `/onboarding` (pure `isProtectedPath()`, unit-tested). Fails CLOSED when Supabase env is missing.
- Migration `supabase/migrations/20260707000001_profiles.sql`: `profiles` (role enum student/parent/teacher, display_name), RLS owner-only, `handle_new_user` signup trigger.
- Landing v0: `app/(marketing)/{layout,page}.tsx` + `components/marketing/mountains.tsx`. Cat-approved lines verbatim; drafts marked `NEEDS-CAT`.
- CI: `.github/workflows/ci.yml` (typecheck → lint → format check → tests → token guard → build; separate `rls` job with local Supabase; non-blocking audit), `.github/dependabot.yml`.
- Security: headers in `next.config.ts` (CSP self-only + Supabase connect; `unsafe-eval` in development only), `lib/utils/rate-limit.ts`, `docs/security.md` (living checklist), `docs/SETUP.md` (operator runbook).

### 4. Scope
✅ Delivered — see §3.

### 5. Out of scope
Everything Guidepost (M1+), billing, LLM, dashboard tools.

### 6. Dependencies (external, still open — operator tasks for Cat, not code)
Per `docs/SETUP.md`: create Supabase staging + prod projects and `supabase db push` migrations; configure Google OAuth; create the Vercel project with env vars (server-only vs public table in SETUP.md); enable `main` branch protection with required CI checks.

### 7. Implementation plan
Done; no code tasks remain.

### 8. File touchpoints
Listed in §3.

### 9. Data and state implications
`profiles` only; RLS from migration one. `role` is self-descriptive (user-chosen, PRD §6.1), NOT a permission tier — re-review policies if that ever changes (comment in migration 0001).

### 10. Testing and verification
All verified in-session: typecheck/lint/tests/build green; token guard fails on planted hex; security headers observed served; Playwright at 375px shows zero horizontal overflow.

### 11. Acceptance criteria
Met, except: production URL live + auth round-trip on production — blocked only on §6 operator tasks.

### 12. Risks and open questions
None in code. Operator provisioning is the only gate to a live deployment.

### 13. Handoff notes for Opus 4.8
- Never regress: the token guard (no hex outside `app/globals.css`), the security-header set, fail-closed middleware, `no-explicit-any` as an error.
- `pnpm format` runs Prettier over the tree; run it before every commit (CI checks formatting).

---

## Milestone 1 — Guidepost engine core (CODE COMPLETE; approvals pending)

### 1. Milestone objective
The product's spine: Cat's Green + Yellow dialogue as versioned verbatim data, a pure deterministic state machine, the LLM abstraction with a zero-cost `verbatim` provider, safety lexicon v0, the `/api/checkin` endpoint, the check-in UI, all core tables with owner-only RLS, and the skippable Discover Your Path quiz scaffold.

### 2. Source grounding
Scaffolding plan §M1/§3; PRD §3.1 (six-stage skeleton), §3.2 (paths + fallbacks), §3.3 (tone system), §3.4 (quiz), §6.2 (engine requirements), §6.3 (safety), §7 (data model); `docs/paths/green-path.md`, `docs/paths/yellow-path.md`; `docs/onboarding/big-five-quiz.md`; CLAUDE.md §The Guidepost Engine.

### 3. Current state (what exists — the foundation everything later builds on)
- **Content model:** `content/schema.ts` — Zod discriminated union (`choice`/`freeText`/`tool`/`message`/`reflection`/`end`); nodes carry verbatim `juniper.text` + optional `evening` variant, `response` acknowledgments, `tip` slots, `variantOnly`, fallback edges (`idk`/`nothingSoundsRight`/`stillStuck`), `adaptable` flag, `sourceRef`, `needsCat`. `validatePathContent()` checks edges/reachability; `@return` sentinel (`RETURN_TARGET`) resumes after fallback detours.
- **Verbatim lock:** `content/authored.lock.json` pins 295 authored strings via `collectAuthoredStrings()` in `content/index.ts`; `tests/content-integrity.test.ts` fails on any change; regenerate ONLY with `pnpm content:lock` inside a `content:` commit.
- **Content:** `content/paths/{green,yellow}.ts` (all six stages, all Yellow 2A–2E branches, evening-only nodes), `content/quotes/{green,yellow}.ts`, `content/tools/mini-reset.ts` (both toolkits verbatim), `content/tone/tones.ts` (cheat-sheet descriptors), `content/router.ts` (entry prompt "How are you feeling today?" — authored; Blue/Red options flag-gated), `content/safety/crisis.ts`, `content/quiz/big-five.ts` (25 questions verbatim).
- **Engine:** `lib/guidepost/machine.ts` — `startSession(ctx, variant)` / `advance(state, input, ctx)`; pure (no LLM/network/clock); handles message auto-advance, variant skipping, evening text selection, `@return`, `response` acknowledgments; throws `EngineInputError` on invalid input. Plus `lib/guidepost/{router,types,api-schema,safety-messages}.ts`.
- **LLM layer:** `lib/llm/types.ts` (`LLMProvider { chat, stream }`), `lib/llm/provider.ts` (`getProvider()` from `LLM_PROVIDER`; `verbatim` implemented; `anthropic`/`openai` throw "arrives in M2"), `lib/llm/safety.ts` (deterministic lexicon; categories `self-harm`/`abuse`/`danger`; leet/case tolerant; conservative — false positives acceptable, false negatives not).
- **DB:** `supabase/migrations/20260707000002_guidepost_core.sql` — `chat_sessions`, `chat_messages` (owner via session join), `reflections`, `aha_moments`, `habits`, `habit_checks` (owner via habit join), `goals`, `weekly_horizons`, `personality_profiles` (unique per user; nullable score columns), `rate_limit_counters` (policy-less RLS; reachable only via `check_rate_limit(p_key,p_limit,p_window_ms)` security-definer RPC, execute granted to `authenticated` only). RLS verified in-session against Postgres 16 with an auth shim AND covered by `tests/rls/policies.test.ts` (env-gated; the CI `rls` job runs it on a local Supabase stack).
- **API:** `app/api/checkin/route.ts` — fixed order: auth → per-IP in-memory backstop + per-user `check_rate_limit` RPC → Zod parse → session create (router input) or load → **safety screen on any free text before anything else** (crisis: pause flow, close session with category-only marker, persist authored safety lines, stream them whole — never through the LLM) → `advance()` → persist `chat_messages` + session state (+ `reflections` on quote pick, `aha_moments` on Yellow capture) → SSE (`message`/`token` events per Juniper line + terminal `state` frame per `CheckinStateFrame`).
- **UI:** `app/(app)/checkin/page.tsx` + `components/guidepost/checkin-client.tsx` (SSE parsing, bubbles, option buttons, free text, quote picker, tip boxes that hide when empty, fallback chips, stage dots — NO timers anywhere), `components/tools/{covey-quadrant-sorter,mini-reset-toolkit}.tsx`, `components/guidepost/quiz-client.tsx` + `app/(app)/onboarding/quiz/` (skippable "Explore the App First", raw answers upsert; `lib/personality/scoring.ts` deliberately returns `null` pending OQ2).
- **Tests:** 120 passing (+31 RLS env-gated): machine traversals (both variants, every branch, every fallback, processing-changes loop), safety red-team fixtures, provider round-trip, schema validation, quiz shape, rate limiter, tokens, routes.

### 4. Scope
✅ Delivered — see §3.

### 5. Out of scope
Everything in M2/M3 below.

### 6. Dependencies to CLOSE this milestone (not code tasks)
1. Cat's approve/rewrite pass on `docs/content-review/m1-for-cat.md`. **Partially resolved 2026-07-08** (see Decisions): router Yellow label rewritten (D6), G-G3 confirmed (D7), G-G4 given new copy (D8), crisis-copy *intent* given but exact intro/trusted-adult wording still needs sign-off (D3). **Still needs Cat:** the exact crisis lines, and the remaining path-draft microcopy in the review packet.
2. CI `rls` job observed green on GitHub runners (it could not run in the build sandbox; local Postgres verification passed).
3. Production E2E (full Green check-in) once SETUP.md provisioning exists.

### 7. Implementation plan
Delivered; the commit map is `49c4dc4`…`97bcf77` on the working branch.

### 8. File touchpoints
See §3.

### 9. Data and state implications
`SessionState` is serialized in `chat_sessions.state` (server is source of truth). `chat_messages` stores the final rendered text per line with stage. Reflection picks and Yellow Aha! captures persist as side effects keyed off the pre-advance node.

### 10. Testing and verification
See §3 "Tests". Verification pattern for any future engine change: full-traversal tests must touch every node/edge; the content lock must only change in `content:` commits.

### 11. Acceptance criteria
Met in code per the scaffolding plan §M1: a full Green check-in completes in verbatim mode; every authored branch/fallback unit-tested; content lock enforced; RLS policy-tested.

### 12. Risks and open questions
- Cat's approvals are the only content gate; her rewrites land as `content:` commits + `pnpm content:lock`.
- **OQ2 (quiz scoring rubric)** — basis now set (D9: Vanessa Van Edwards communication-styles on the Big Five), but the concrete A/B/C → style → tone mapping and the source/"API" are still open, so scoring stays stubbed; M5 matching still blocked on the same mapping.

### 13. Handoff notes for Opus 4.8
- **Never** edit `content/authored.lock.json` by hand. Never paraphrase a locked string. Content edits = edit the content file → `pnpm content:lock` → `content:` commit.
- New dialogue behavior goes into content data + machine (with tests) — never into the route handler or components.
- The machine is pure; keep it that way. Anything needing IO belongs in the route.
- The safety-screen ordering in `app/api/checkin/route.ts` is load-bearing. Do not move it, wrap it, or add any processing before it.

---

## Milestone 2 — Phase 1 complete: LLM adaptivity, tools, safety v1, dashboard v1, billing, interactive hero

### 1. Milestone objective
Turn the working verbatim engine into the full PRD Phase 1 product: Juniper's tone-adaptive voice (LLM on, guarded by a tone eval), the remaining in-dialogue tools, the first dashboard, the completed safety layer with non-identifiable telemetry, freemium billing with easy cancel, and the landing page's interactive reflective hero. Exit = PRD §10 Phase 1 checklist fully shippable.

### 2. Source grounding
- PRD §3.3 (tone table + Stage-5 recalibration), §3.4 (quiz purposes/privacy), §4.1–4.2 (tools), §5 (interactive hero: "a small taste of the Guidepost check-in… with a live, gentle response"), §6.2 (LLM adapts phrasing / handles free text / selects tone variants — never invents flow), §6.3 (safety, telemetry privacy), §6.5 (freemium: free tier "genuinely useful," cancel in two taps, no retention dark patterns), §8 (streamed responses; "automated eval suite that regression-tests Juniper's outputs against the voice guide before prompt changes ship"), §9 (guardrails: cancellation under 60 seconds; safety escalations reviewed weekly), §11 (OQ1 provider, OQ4 consent, OQ6 pricing).
- Scaffolding plan §M2, §4.4 (tone eval), §5 (security checklist); brief §Business Model; CLAUDE.md §Brand Voice (the Do/Don't lists feed the eval) and §Safety & Escalation.
- `docs/content-review/m1-for-cat.md` (gap register). Root `index.html` — Cat's static landing mockup added to `main` 2026-07-07 (design reference; see WS8).

### 3. Current state
Reuse everything in M1 §3. Specifically relevant hooks that already exist:
- `adaptable` flags mark exactly which messages the LLM may touch.
- `SessionState.choices` records the Stage-5 selection per node (tone input); `EngineOutput.toneTag` flows through the SSE `state` frame.
- `content/tone/tones.ts` descriptors are ready to feed prompts.
- Rate limiting (in-memory + RPC) already guards the endpoint.
- Dashboard tables (`habits`, `habit_checks`, `aha_moments`, `weekly_horizons`, `reflections`, `goals`) exist with RLS; `app/(app)/settings/page.tsx` stub already promises "cancel in two taps".
Avoid: do not add a second rate limiter, content loader, or message renderer — extend the existing ones.

### 4. Scope
Workstreams WS1–WS8 below.

### 5. Out of scope
Blue/Red content and permeability (M3); Streak System UI, Goal Microflow Tracker, Progress Reflection tools (M3, behind `FF_DASHBOARD_EXTRAS`); community/posts/moderation/referral (M4); tutoring (M5); Google Calendar integration (OQ3 resolved for v1: manual in-app day sketch only); quiz scoring (OQ2-blocked); school/institutional tier.

### 6. Dependencies
- M1 complete (it is). Where a needed string is still a Cat-pending draft, ship the draft with its existing `needsCat` marker; where a gap has no authored content (G-list), ship the slot hidden. **Never generate dialogue.**
- Operator: `LLM_API_KEY` + `LLM_PROVIDER=anthropic` env in preview/production; Stripe account + keys + webhook secret; Supabase/Vercel provisioning from M0 §6.
- **Provider (D1, RESOLVED):** Anthropic Claude API, chosen by Cat (2026-07-08 follow-up) and wired in WS1 — small/fast model default (`claude-haiku-4-5`, override via `LLM_MODEL`), per-check-in token budget, `verbatim` as the guaranteed default and permanent fallback everywhere (no key ⇒ verbatim, no user-facing error). **Also per D1:** Cat's ultimate direction is a Supabase **source-material knowledge base** the AI draws on (beyond the dialogue tree). She asked to provide the material later, so it is **design-only WS9** here (`docs/plans/source-material-kb.md`), gated on her + a safety/privacy review — not built in M2's adaptivity workstreams.

### 7. Implementation plan (ordered; each workstream = one commit-sized unit, CI green at each)

**WS1 — Anthropic provider + Juniper prompt layer**
1. Add the Anthropic SDK dependency. Import it ONLY inside `lib/llm/` (grep-verify in tests).
2. Implement `anthropic` in `lib/llm/provider.ts`: `chat` + `stream` per the existing `LLMProvider` interface; model id + `maxTokens` from `ChatOptions` with a hard default budget; API errors surface as typed failures so callers can fall back to verbatim (never a user-facing crash).
3. Create `lib/llm/prompts/juniper.ts`: system prompt assembled from (a) persona rules quoting CLAUDE.md §Brand Voice Do/Don't verbatim, (b) the tone descriptor for the current `toneTag` from `content/tone/tones.ts`, (c) a hard constraint block: *rephrase the provided authored line toward the tone; do not add content, advice, questions, or resources; do not change meaning; stay under the original length + 20%; write for a 14-year-old*.
4. Wire adaptation into the `sse()` helper in `app/api/checkin/route.ts`: for each `JuniperMessage` with `adaptable: true` AND provider ≠ verbatim, stream the LLM rephrasing; `adaptable: false` lines (safety, reflection quotes, acknowledgments so marked) always stream verbatim. On any LLM error mid-turn, fall back to the authored text for that message.
5. Feed Stage-5 recalibration: map the recorded choice (`SessionState.choices["s5-checkin"]` for Green / `["s5"]` for Yellow) to its tone per the PRD §3.3 table and pass it into prompts for subsequent messages in the session. The five check-in-response → tone mappings are content data — add them to `content/tone/tones.ts` (they are transcriptions of the PRD table; lock covers them).
6. Unit tests with a mocked provider: adaptable-only application; fallback-on-error; budget passed through; zero adaptation in verbatim mode.

**WS2 — Free-text interpretation + grounded plan-change explanation**
1. `lib/llm/interpret.ts`: `interpretBrainDump(text) → { items: string[] }` — the LLM splits a Yellow 2C brain dump into discrete items (JSON-constrained output, Zod-validated, item-count cap); on failure or verbatim mode, fall back to newline/comma splitting. Feed results into the CoveyQuadrantSorter via the existing `tool.props` (attach `items` when presenting `s2c-sort`).
2. Plan-change "why" (Green `s5-processing` → `s5-processing-help`): build a grounded old-vs-new comparison from THIS session's data only (the user's `s1-mind-scan`/`s2-align`/`s6-goal` texts already persisted in `chat_messages`). Prompt constraint: *explain using only the provided user inputs; no invented details.* In verbatim mode, keep current behavior (authored follow-up question only). The authored "Does that help?…" line still closes the beat verbatim.
3. Tests: interpretation fallback path; prompt-assembly test asserting only session-scoped strings are included (no email/display_name/profile fields — PRD §6.3 privacy; scaffolding plan §5 "LLM data hygiene").

**WS3 — Tone regression eval (the PRD §8 "reliability of tone" requirement)**
1. `tests/evals/voice-lint.test.ts` — BLOCKING, deterministic, runs in the main CI job: scan all user-facing strings (collected content strings + JSX string literals under `components/` and `app/`) for the banned lexicon from CLAUDE.md Do/Don't — clinical terms ("disorder", "deficit", "intervention", "diagnose") and ed-tech buzzwords ("gamified", "unlock your potential"); assert safety content contains the authored boundary line and both hotline strings; enforce a reading-level ceiling (≈ grade 8) on Juniper strings via a standard readability formula.
2. `tests/evals/tone-judge.test.ts` — NON-BLOCKING, key-gated (same pattern as the RLS suite): a golden set of authored lines per tone tag → adapted output judged by the LLM against the cheat-sheet descriptor plus "would this feel safe to a stressed 14-year-old"; runs as a report-only CI job, path-filtered to `lib/llm/prompts/**` and `content/tone/**`.
3. CI: add the path-filtered eval steps; document the judge's promotion-to-blocking criteria in a workflow comment.

**WS4 — Safety v1 completion**
1. Migration `supabase/migrations/20260707000003_safety_events.sql`: `safety_events` (id, `category` text, `path` guidepost_path null, `stage` int null, `day` date default current_date) — **NO user_id, NO session_id, NO text** (CLAUDE.md: "No identifiable logging in safety telemetry"). RLS enabled; inserts only via a security-definer `log_safety_event(category, path, stage)` granted to `authenticated`; no select policy (the weekly review per PRD §9 happens via the SQL editor/service role).
2. Call `log_safety_event` from the crisis branch of `app/api/checkin/route.ts` (after the pause, before the response). Keep the existing guarantee that trigger text is never persisted.
3. Optional second-pass classifier `lib/llm/safety-classifier.ts`: when the lexicon passes AND provider ≠ verbatim, a cheap LLM yes/no crisis check on free text. The classifier may only ADD flags — it can never clear a lexicon hit (the lexicon is the floor). Timeout-bounded; on timeout/error, proceed as lexicon-passed. Behind env `SAFETY_CLASSIFIER=true`, default off until reviewed.
4. Reflective-depth cap (PRD §6.3 "pathways cap reflective depth"): add a per-session counter in `SessionState` for consecutive free-text emotional-probe turns; past the cap, the machine offers the authored Mini Reset instead of another probe. **RESOLVED (D4): cap = 3 probing questions.** New requirement: the reset must read as **non-dismissive and not abrupt** — no jarring tone shift (the transition copy is `needsCat`; more layers planned later). Qualifying nodes still need Cat's confirmation; list in `docs/content-review/m2-for-cat.md`.
5. Extend `tests/rls/policies.test.ts` for `safety_events` (no direct read/write; RPC insert works; anon denied). Re-run the red-team suite.
6. **Trusted-adult "equip, don't just name" (D3):** the crisis node's trusted-adult beat should give the user **scripts, tools, and guidance** for actually approaching a trusted adult (Cat's direction), not merely suggest one. Implement the *structure* for this (e.g. an authored "how to start that conversation" tool/slot); **the exact copy is `needsCat`** — do not write the scripts here, and re-ask Cat for the intro/trusted-adult wording (her recorded answer was partly an unclear transcription). All of it stays `adaptable: false`.

**WS5 — Remaining in-dialogue tools (structured UI, never text blobs)**
Content rule for every tool: verbatim strings only, from `docs/tools/reusable-tools.md` + the path docs; gaps ship as hidden slots. Per-tool gap table:

| Tool | Authored source | Gap |
|---|---|---|
| Start Small Planner | PRD §4.1 one-liner ("breaks big tasks into light, visible, under-2-minute first steps"); Yellow S5 micro-tip is authored | G-T1: interior copy |
| Micro-Needs Menu | item seeds authored (PRD §4.1 / Blue doc: "stretch, silence, water, reassurance, direction") | G-T2: full list + per-item responses |
| Gentle Focus Anchor | one-line description only | G-T1 |
| Mood-Matching Visual | described (color wheel / metaphor deck / body map) | G-B2: the actual items |
| Evening Wind Down | Green evening prompts authored; universal set missing | G-T3 |
| Aha! Moment Tracker | flow authored in Yellow S6 (short text + tag) | none — build fully |

1. Build each as `components/tools/<name>.tsx` following the existing `CoveyQuadrantSorter`/`MiniResetToolkit` pattern (props in, `onDone(result)` out, thumb-reach at 375px, no timers). Register each in `checkin-client.tsx`'s tool switch; the `ToolTypeSchema` in `content/schema.ts` already enumerates all eight names — verify exact matches.
2. Populate props from `content/tools/…` files, covered by the lock. Where the table says gap: render only the authored subset and hide empty sections.
3. AhaTracker: text + optional tag; persists via the existing `/api/checkin` side effect (Yellow) and via a server action from the dashboard (WS6).
4. Unit/UI tests per tool (render, result shape, disabled states).

**WS6 — Dashboard v1**
1. `app/(app)/dashboard/page.tsx`: replace stubs with live cards — Habit Tracker, Aha! log, Weekly Horizon, recent reflections. Server component via `lib/supabase/server.ts`, `force-dynamic` (established pattern).
2. Habit tracker: server actions in `app/(app)/dashboard/actions.ts` — create/archive habit, toggle today's `habit_checks` (unique `(habit_id, checked_on)` already enforced); streak count computed from checks with **gentle reset — no shame messaging** (copy drafts `needsCat`; the full Streak System UI is M3).
3. Weekly Horizon minimal: create/view the current week's `weekly_horizons.intentions` (list of strings). This is the anchor Green S2 and the still-stuck fallback reference — extend `checkin-client.tsx` so the fallback's "Show me my Weekly Horizon" option actually displays the user's intentions (small GET endpoint or data embedded in the state frame — implementer's choice; keep it simple).
4. Reflections history (read-only list: quote + date) and Aha! log (list + add via the AhaTracker component).
5. RLS already covers all tables; UI covered by the WS8 Playwright pass.

**WS7 — Freemium billing (PRD §6.5; anti-money-grab is a core value)**
1. Migration `supabase/migrations/20260707000004_billing.sql`: `billing_customers` (user_id unique ↔ stripe_customer_id), `subscriptions` (user_id, stripe_subscription_id, status, current_period_end) — RLS: owner select; NO client write policies (writes happen server-side via webhook/service path only).
2. `lib/billing/` module: the Stripe SDK is confined here (mirror the LLM-layer boundary rule); checkout-session creation, customer-portal session creation, subscription-status read, entitlement logic.
3. Routes/actions: `app/(app)/settings/` gains "Upgrade" (checkout) and "Manage / Cancel" (customer portal — this is the "cancel in two taps": settings → portal cancel). `app/api/webhooks/stripe/route.ts`: **signature verification with `STRIPE_WEBHOOK_SECRET` is mandatory**; idempotent event handling (upsert-by-subscription or processed-event-id guard); updates `subscriptions`.
4. Entitlement: free tier = **1 full check-in per day + unlimited Mini Resets** — **placeholder accepted by Cat (D2)**; constants stay config-driven and price is TBD (Cat sets later). Enforced in `/api/checkin` after auth, with kind copy on the paywall response (draft, `needsCat`). The free tier must remain "genuinely useful — not a teaser" (PRD §6.5).
5. CSP: add `js.stripe.com` to `script-src`/`frame-src` in `next.config.ts` — nothing else (the config comment already reserves exactly this).
6. Tests: webhook signature rejection; idempotency on retry; entitlement window logic (clock-mocked). Manual Stripe test-mode E2E on preview: subscribe → entitled → cancel in two taps; record the result in the PR.

**WS8 — Interactive hero, age attestation, session resume, E2E**
1. Interactive hero (PRD §5: the visitor "immediately sees their reflection"): a sandboxed engine taste on `app/(marketing)/page.tsx` — reuse `startSession`/`advance` purely client-side with the existing content registry; **no auth, no DB writes, no LLM calls**. Option taps only; if a free-text node is reached, show a sign-up invitation instead of processing text. **Assumption: the exact hero exchange script is gap G-L1 (needs Cat) — until then use the authored router prompt plus one authored Yellow beat, verbatim.**
   **Design reference:** root `index.html` is Cat's static landing mockup. Treat it as visual direction (section order, feel). **Open questions for Cat:** it loads external fonts (Fontshare/Google) — conflicts with the self-only CSP and the no-third-party rule (self-host equivalents or drop them?); and should `index.html` be removed from the repo root once the Next landing matches it (it is not served by Next)? Do not copy its markup wholesale; rebuild with tokens.
2. Age attestation (OQ4 posture): required 13+ checkbox on sign-up (`components/ui/auth-form.tsx`) — attestation only, no DOB collected (data minimization); the parental-consent slot stays reserved in onboarding; update `docs/security.md`.
3. Session resume: on `/checkin` load, look for the user's most recent `chat_sessions` row with `ended_at IS NULL`; offer "pick up where you left off" (draft copy `needsCat`) vs starting fresh (closes the stale session). The machine already serializes everything needed in `state`.
4. `docs/content-review/m2-for-cat.md`: every new draft string, the depth-cap assumption, OQ6 numbers, hero script gap G-L1, and the `index.html` questions.
5. Playwright E2E (CI-able + preview): full Green + Yellow check-ins including evening (mock the client clock), fallback detours, habit toggle, quiz skip and retake, hero interaction, paywall boundary, resume flow.

**WS9 — Source-material knowledge base (DESIGN-ONLY in M2; D1) — DONE (design)**
Cat's ultimate direction (D1) is a Supabase store built from her source material that the AI draws on to answer/guide, because the dialogue tree alone "is not complex enough." This is a real architectural evolution beyond M2's "rephrase authored text only" and must not be built inline — the **design doc is written** (`docs/plans/source-material-kb.md`); no retrieval is shipped. Cat deferred the source material, so the build stays gated. The design must preserve every non-negotiable: the safety screen still runs first; the **state machine still owns flow** (retrieval informs phrasing/answers within a node, never node/stage selection); no fabricated dialogue or reflection quotes; authored IP stays verbatim and lock-protected; retrieval is grounded only in Cat-approved source material (provenance tracked). Open inputs to resolve first: provider choice (D1), what the "API for the source material" is, and how this reconciles with the deterministic/verbatim guarantees. Gate: Cat + a review sign off the design before any build milestone picks it up.

### 8. File touchpoints
`lib/llm/{provider,interpret,safety-classifier}.ts`, `lib/llm/prompts/juniper.ts` · `content/tone/tones.ts` (+ lock) · `tests/evals/*` · `supabase/migrations/20260707000003_safety_events.sql`, `20260707000004_billing.sql` · `app/api/checkin/route.ts` · `app/api/webhooks/stripe/route.ts` · `lib/billing/*` · `components/tools/{start-small-planner,micro-needs-menu,gentle-focus-anchor,mood-matching-visual,evening-wind-down,aha-tracker}.tsx` · `components/guidepost/checkin-client.tsx` · `app/(app)/dashboard/{page.tsx,actions.ts}` · `app/(app)/settings/page.tsx` · `app/(marketing)/page.tsx` · `components/ui/auth-form.tsx` · `next.config.ts` (CSP) · `.env.example` · `docs/{security.md,SETUP.md,content-review/m2-for-cat.md}` · `tests/**`.

### 9. Data and state implications
- New tables: `safety_events` (identifier-free by design — treat any change adding user linkage as a privacy regression), `billing_customers`, `subscriptions`. No new columns on existing tables.
- `SessionState` gains the reflective-depth counter — must be backward-compatible (default 0 when absent; old serialized sessions still deserialize).
- LLM requests carry session-scoped content only; never email, display name, or profile rows.
- Hero mode never touches the DB; entitlement checks must not affect verbatim/demo behavior.
- The product must remain fully usable with `LLM_PROVIDER=verbatim` — that is the permanent degradation path, not a temporary state.

### 10. Testing and verification
Per commit: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` + `node scripts/check-tokens.mjs`. New: voice-lint eval blocking in CI; judge eval report job; RLS suite extended; webhook + entitlement unit tests; mocked-provider adaptation tests; the WS8.5 Playwright list; grep-guards: no Anthropic import outside `lib/llm/`, no Stripe import outside `lib/billing/` + its webhook route.

### 11. Acceptance criteria
1. With `LLM_PROVIDER=anthropic` + key: adaptable Juniper lines stream tone-adapted; `adaptable: false` lines are byte-identical to authored text; killing the key mid-session degrades to verbatim with no user-facing error.
2. With `LLM_PROVIDER=verbatim`: the entire product behaves exactly as in M1 (regression suite green).
3. The voice-lint eval blocks a PR introducing a banned term (demonstrated via test fixture).
4. Crisis input: flow pauses, authored resources shown, `safety_events` gains a row with category/path/stage/day and nothing else; no dialogue text or user id is recorded anywhere.
5. All eight in-dialogue tools render from content data; gap slots hidden; the content lock diff is empty except deliberate `content:` commits.
6. Dashboard: create habit → check today → streak shows; an Aha! saved in Yellow appears in the log; a set Weekly Horizon is visible from the still-stuck fallback.
7. Stripe test mode: subscribe → entitlement lifts the daily limit; cancel via settings → portal in two taps; webhook rejects bad signatures (400) and is idempotent on retries.
8. The landing hero delivers an interactive authored taste at 375px with no auth and no writes.
9. PRD §10 Phase-1 list is fully present: landing with interactive hero; auth + role selection + onboarding; Green and Yellow end-to-end with evening variants, Mini Reset Toolkit, and reflection quotes; Aha! tracker; habit tracker; safety layer v1; freemium billing; mobile-first.

### 12. Risks and open questions
- **Provider (D1) RESOLVED** — Anthropic Claude API (WS1). Token cost at freemium scale still unknown; the token budget + `verbatim` fallback + a partially-verbatim free tier are the levers. Set production `LLM_API_KEY` + `LLM_PROVIDER=anthropic` when ready; until then everything runs verbatim.
- **Source-material KB (D1)** — deferred (Cat provides material later); WS9 is design-only and gated (`docs/plans/source-material-kb.md`). Risk: it can quietly erode the "machine owns flow / no fabrication / verbatim IP" guarantees if built without that discipline. Do not let it leak into shipping workstreams before the gate.
- **OQ6 pricing — RESOLVED (D2):** placeholder tiers accepted; price TBD (config-driven).
- **Depth cap — RESOLVED (D4):** cap = 3; reset must be non-dismissive/not abrupt (transition copy `needsCat`).
- **Crisis copy (D3)** — intent set (equip with scripts/tools/guidance); exact intro/trusted-adult lines still need Cat (her answer was partly an unclear transcription).
- **G-L1** hero script — authored-fragments approach until Cat writes it.
- **`index.html`** mockup: font/CSP conflict + removal question (WS8.1).
- Stripe webhooks against per-branch preview URLs need per-env endpoint configuration (add to SETUP.md when wiring).

### 13. Handoff notes for Opus 4.8
- Execute WS1→WS8 in order. WS3 (eval) must exist before iterating on prompts; WS4 before enabling `SAFETY_CLASSIFIER`.
- The LLM never selects nodes, options, or stages. If a task appears to require that, the design is wrong — stop and re-read PRD §6.2.
- Reflection quotes, safety content, and `adaptable: false` acknowledgments are never sent to the provider for rephrasing.
- Every new draft string gets `needsCat` and a line in `docs/content-review/m2-for-cat.md` in the same commit.
- No analytics, tracking pixels, or dialogue-content logging anywhere — including Stripe metadata and LLM request logs.

---

## Milestone 3 — Blue + Red paths behind flags, permeability, Red release gate

### 1. Milestone objective
Enter Cat's Blue (From Disconnection to Awareness) and Red (From Overwhelm to Ownership) paths verbatim, implement mid-flow path permeability, and place Red behind a structurally enforced double gate whose only key is a signed safety review. Production behavior is unchanged until flags flip.

**Framing update (D5, Cat 2026-07-08):** being on the Red Path does **not** by itself mean imminent danger — it means the user is **dysregulated and needs a nervous-system reset**. Users move between paths day-to-day with no positive/negative build-up (Green→Red or Red→Green are both normal). The line between everyday dysregulation and "needs a professional" is set by the **intensity, frequency, and duration** of Red-Path usage over time — that is the core question the safety review must answer (see §7.4c). Red is still gated, but the gate's *purpose* is defining that threshold, not treating every Red session as a crisis. The per-turn crisis lexicon (M1/M2-WS4) is the separate, always-on danger check and is unchanged.

### 2. Source grounding
`docs/paths/blue-path.md` (flow, cheat sheet, storyboard); `docs/paths/red-path.md` (Cat confirmed 2026-07-07: repeated sections are text duplication only; the spec is complete); PRD §3.2 (path table + "Paths are permeable" rules), §6.2 (mid-flow shifts per Blue Stage 3), §6.3 (Red/Blue always offer grounding exits; Red has the "tightest integration with the safety/escalation layer"); scaffolding plan §M3 + resolutions C1/C5 (recorded in `docs/plans/scaffolding-plan.md` §0); CLAUDE.md ("The Red Path cannot ship without a dedicated safety review").

### 3. Current state
- `content/router.ts` already carries flag-gated Blue ("I'm fine." — authored) and Red ("🟥 Overwhelmed" — authored) options; `lib/flags.ts` already implements the Red double gate (`FF_RED_PATH` AND `RED_PATH_RELEASE_APPROVED`).
- `validatePathContent()` already accepts external cross-path targets (`externalTargets`, tested with `yellow:entry`-style ids) — but the machine does NOT yet execute cross-path shifts.
- `content/tools/mini-reset.ts` is typed `Record<"green"|"yellow",…>` — extend for Red's authored toolkit.
- Quote canon (C5, resolved): Red Stage 6 uses the "Updated for Emotional Resilience" standard + evening sets; the processing-changes beat IS part of Red Stage 5 (storyboard slides 9–10).
- Router (D6): the entry question is a **4-way** router by user state (Green/Yellow live, Blue/Red flag-gated); the Yellow entry label is now Cat's wording (D6, applied as a content follow-up). Confirm all four entry labels read in Cat's voice when Blue/Red unflag.

### 4. Scope
(1) Blue content verbatim; (2) Red content + quotes + toolkit verbatim; (3) cross-path shift mechanics; (4) Red gate enforcement + review template; (5) Blue heart-loud interim while Red is gated; (6) `FF_DASHBOARD_EXTRAS` tools (Streak System UI, Goal Microflow Tracker, Progress Reflection flows — their weekly-pattern prompts and habit-loop templates ARE authored in the path docs); (7) M3 review packet.

### 5. Out of scope
Unflagging Blue or Red in production (Cat's call after content review; Red additionally after the signed safety review); community (M4); Blue/Red-specific prompt tuning beyond the existing tone system.

### 6. Dependencies
M2 complete (tone eval exists so Blue/Red tags flow through it; Micro-Needs Menu and Mood-Matching Visual components exist for Blue's summons). Content gaps that block UNFLAGGING (not scaffolding): G-B1 (per-metaphor Stage 2 responses), G-B2 (Mood-Matching Visual items), G-B3 (grounding breath script), G-B4 (heart-loud interim copy), G-R1 (canonical Stage 2 weight options — storyboard's six quick-taps assumed), G-R2 (ask-for-help scripts), G-R3 (deadline-reality dialogue), G-R5 (Red escalation thresholds — safety-review scope). A safety reviewer must be identified (human task).

### 7. Implementation plan
1. **Blue content** (`content/paths/blue.ts`, verbatim from `docs/paths/blue-path.md`): S1 surface scan — the three authored user options each with their authored Juniper responses; S2 vibe check with the five verbatim metaphor options (☁️ Numb / 🔁 On autopilot / 📦 Boxed in / 🎭 Faking it / 📏 Managing) + Mood-Matching Visual summon — **S2 per-option branch responses are gap G-B1: route all five to the shared S3 beat until Cat authors them (annotate in code)**; S3 mismatch moment with the four storyboard options → head full = shift `yellow:s1`; heart loud = Red target (see step 5); body tired = Micro-Needs Menu summon then S4; "I honestly don't know" = stay Blue → S4; S4 quiet needspotting (Micro-Needs Menu); S5 reorientation (the four authored option families, with Gentle Focus Anchor / Start Small Planner summons, rest time-block, idk micro-actions); S6 closure/re-entry (stay / → `yellow:s1` / → `green:welcome` / grounding close — **grounding script is G-B3: ship the beat with a hidden slot**) with the five authored reflection tags as Blue's reflection bank. Register in `content/index.ts`; `pnpm content:lock`.
2. **Red content** (`content/paths/red.ts` + `content/quotes/red.ts` + toolkit extension, verbatim from `docs/paths/red-path.md`): S1 regulation-first physical check (pause-and-care vs proceed); S1B emotional check-in (three authored options); S2 biggest-weight naming — storyboard slide 4's six quick-taps mapped to 3A/3B (**G-R1 assumption; annotate**); S3A name 1–3 priorities (freeText) and S3B Mini Reset branch with Red's authored toolkit (five reset options, self-talk prompts, completion cue "I'm feeling more grounded now") — **ask-for-help scripts (G-R2) and the deadline-reality check (G-R3) ship as annotated hidden slots**; the regulated-shift node per storyboard slide 7 (authored prompt + three options → `green:welcome` / `yellow:s1` / stay); S4 Covey sort with Do Now / Do Later / Delegate / Drop framing (extend `CoveyQuadrantSorter` with a `quadrantLabels` prop — do not fork the component); S5 reality check + re-scope including the processing-changes beat; S6 reflection using the "Updated for Emotional Resilience" standard + evening banks. Put `stillStuck`/`nothingSoundsRight` fallbacks on every Red choice/freeText node — grounding exits everywhere (PRD §6.3).
3. **Cross-path shifts**: extend `lib/guidepost/machine.ts` to resolve `"<path>:<nodeId>"` targets — `advance` returns a `pathShift` marker in `EngineOutput`; `app/api/checkin/route.ts` handles it by updating `chat_sessions.path`, appending to a new `path_history` jsonb column (migration `supabase/migrations/20260707000005_path_shifts.sql`; RLS unchanged), and swapping the engine context. `SessionState.path` updates; `choices` persist across the shift. The route must check flags at shift time (a shift into a gated path is refused), not only at entry.
4. **Red gate enforcement**: (a) content-loader guard — Red is exposed only through a function that throws in production builds unless both gate envs are true; (b) a CI test that simulates production + unset flags and asserts Red is unreachable via router AND via shift; (c) `docs/safety/red-path-review.md` template: reviewer identity, scripted crisis-handling transcripts (red-team runs through Red, including lexicon hits mid-Red), escalation-threshold sign-off (G-R5), legal check, and the explicit statement that `RED_PATH_RELEASE_APPROVED` may be set only after signature. **Per D5, the escalation threshold is framed as intensity/frequency/duration of a user's Red-Path usage — computed from that user's OWN owner-only `chat_sessions` history and surfaced only to them (never to parents/teachers, never in the identifier-free `safety_events` log). Reviewer + timing are still open (human task).**
5. **Blue heart-loud interim (G-B4)**: while Red is gated, Blue S3 "heart's loud" routes to a grounding-exit node built ONLY from authored material (Blue's Micro-Needs beat + the authored "Can we end with something grounding?" closure option) with one annotated `needsCat` bridge line; it must never dead-end. When Red unflags, retarget to `red:s1` (single-line content change).
6. **Dashboard extras behind `FF_DASHBOARD_EXTRAS`**: Streak System UI (gentle reset messaging — drafts `needsCat`); Goal Microflow Tracker (CRUD on the existing `goals` table; short/mid/long horizons per PRD §4.2); Progress Reflection flows — end-of-week pattern prompts and habit-loop (cue → craving → response → reward) templates entered VERBATIM from the Green/Yellow/Red docs into `content/tools/weekly-reflection.ts` (+ lock), rendered as a dashboard flow.
7. **Review packet** `docs/content-review/m3-for-cat.md`: all G-B*/G-R* slots with file locations; the G-R1 quick-tap assumption; separate unflagging checklists for Blue (content approvals only) vs Red (content approvals + signed safety review).

### 8. File touchpoints
`content/paths/{blue,red}.ts`, `content/quotes/red.ts`, `content/tools/{mini-reset,weekly-reflection}.ts`, `content/index.ts`, `content/authored.lock.json` · `lib/guidepost/{machine,types,router}.ts` · `app/api/checkin/route.ts` · `supabase/migrations/20260707000005_path_shifts.sql` · `components/tools/covey-quadrant-sorter.tsx` (labels prop) · dashboard-extras components + `app/(app)/dashboard/` · `lib/flags.ts` (verify only) · `docs/safety/red-path-review.md`, `docs/content-review/m3-for-cat.md` · `tests/guidepost/*`, `tests/content-*`, `tests/rls/*`, CI workflow (gate assertion).

### 9. Data and state implications
- `chat_sessions.path` becomes mutable mid-session; `path_history` records `{from, to, atNode, at}`. Sessions created before 0005 remain valid (column nullable/defaulted).
- Shift targets are content data (`"yellow:s1"`), validated at build; the machine refuses shifts to unregistered or gated paths at runtime.
- Red content exists in the bundle but must be unreachable in production without both envs — the CI assertion is the regression guard.

### 10. Testing and verification
Full traversal tests for Blue (all S1 options, all four S3 branches, all four S6 exits) and Red (S1 both branches, S1B, 3A, 3B, regulated shift to both targets, S4–S6, evening variant); shift-state persistence tests; the gate assertion; a flags-off production build shows no user-visible change (router options unchanged; no Red strings served by any endpoint); lock regenerated once per content commit; RLS suite green with 0005; Playwright walkthrough with flags on in preview, recorded for Cat.

### 11. Acceptance criteria
1. Flags off: production identical for users.
2. Flags on in preview: complete Blue and Red walkthroughs match the path docs beat-for-beat; every Juniper line byte-identical to `docs/paths/` (spot-check against the lock).
3. Blue S3 "head full" lands on `yellow:s1` and the session completes with `path_history` recorded; "heart loud" reaches the grounding interim (Red gated) or `red:s1` (Red enabled in preview).
4. The Red regulated-shift node offers Green / Yellow / stay exactly per storyboard slide 7.
5. The CI gate assertion fails if anyone makes Red reachable in production without both envs.
6. `docs/safety/red-path-review.md` exists with the sign-off structure; `RED_PATH_RELEASE_APPROVED` is documented as human-only.
7. Dashboard extras render behind `FF_DASHBOARD_EXTRAS` with verbatim weekly-reflection content.

### 12. Risks and open questions
- G-B1/G-B3/G-B4 block Blue's unflagging; G-R1/G-R2/G-R3/G-R5 + the signed review block Red's. Scaffolding is not blocked by any of them.
- Safety reviewer not yet identified (human task).
- Mid-Red crisis interplay (a lexicon hit while already in Red) must be exercised in the review transcripts — the safety screen already runs on every free text regardless of path; verify no Red node bypasses freeText handling.
- Covey label variants: one component with a labels prop; do not fork the tool.

### 13. Handoff notes for Opus 4.8
- Enter Blue/Red content ONLY from `docs/paths/{blue,red}-path.md`, preserving typographic punctuation; the Red doc's repeated sections are duplication — enter each beat once (Cat, 2026-07-07).
- **Never set `FF_RED_PATH` or `RED_PATH_RELEASE_APPROVED` in any env file, CI config, or Vercel environment. Preview testing uses per-branch env flips performed by a human.**
- The heart-loud interim must never dead-end a user who just signaled emotional load.
- Cross-path shifts are machine mechanics + content data; the route only persists what the machine returns.

---

## Milestone 4 — Community & depth (PRD Phase 2)

> **Gate: still requires human review before execution.** OQ5 is resolved (D10: in-app), and D11 sharply narrows scope — but community is Cat's call on paid/free + moderation staffing, and it's the first role-gated surface.

**Scope reframed by Cat (D10 + D11, 2026-07-08):** build it **in-app** with a **Skool-style forum** (post → others answer), and **limit the forum to parent and teacher accounts only** — Q&A + resources. **No student community: no student↔student and no student↔adult connection.** This removes the student container entirely and drops the students-as-UGC-authors risk. **PRD conflict recorded:** PRD §6.4 described student/parent/teacher containers + overlap; **Cat's decision supersedes it.**

### 1. Milestone objective
Ship a **parent-and-teacher** community: an in-app, Skool-style Q&A/resource forum for adult accounts, with moderation and report flows from day one, the referral incentive, and chat-history UI for students — completing PRD Phase 2 (as narrowed by D11) alongside M3's paths and dashboard tools. Students do not post or read the forum.

### 2. Source grounding
PRD §2 (parent/teacher personas), §6.4 (moderation + report flows "from day one"; referral "framed as sharing help, not growth hacking" — **but its student container + overlap spaces are superseded by D11**), §7 (`posts` sketch), §10 Phase 2, §11 (moderation staffing); Decisions D10/D11; brief §Roadmap; CLAUDE.md (community stub; referral "post-signup, never as a gate"); the landing page's honest "Community — coming" card.

### 3. Current state
`app/(app)/community/` is an empty auth-protected stub. `profiles.role` exists (student/parent/teacher — currently self-descriptive). Nothing else. **Standing rule from migration 0001's comment: the moment `role` gates any read, the profile policies and the role-change path must be re-reviewed — role changes likely move server-side here.**

### 4. Scope
1. Migration `20260707000006_community.sql`: `posts` (author_id, content, created_at — **no student container per D11**; a single adult forum, optionally a `topic`/`category` field for Q&A vs resources), `post_reports` (post_id, reporter_id, reason, status), `moderation_actions`. **RLS (simplified by D11):** read/write allowed only to accounts whose `profiles.role` is `parent` or `teacher`; **students have no access to `posts` at all** (policy denies student role outright); author-only edit/delete; reports writable by any forum member, readable only by moderators. This is the first place `role` gates reads — so the matrix is just {student = none, parent/teacher = full forum}.
2. Role hardening: move `profiles.role` changes server-side; re-review the 0001 policies per its comment (now load-bearing, since `role` gates forum access).
3. Community UI: container feeds, post composer (length-limited; no media in v1 — Assumption), a report button on every post, removed/pending states.
4. Moderation surface: a minimal moderator queue (**Open question: who moderates and how moderators are designated — PRD §11 leaves staffing open**), remove/restore actions, report resolution.
5. Referral incentive: invite code/link + attribution, surfaced post-signup only, never a gate; **reward mechanics are an Open question for Cat** (PRD §6.4 says only "reward for bringing someone in") — scaffold codes + attribution, leave the reward config-driven.
6. Chat history UI: list of past check-in sessions (path, date, chosen reflection) reading the existing `chat_sessions`/`chat_messages`/`reflections` — owner-only, already RLS-safe ("continuity, not surveillance", PRD §7). This is student-facing and unrelated to the adult forum.
7. Safety: adult post text still runs through `lib/llm/safety.screen()` BEFORE persisting (adults can be in crisis too); on a hit, resources shown privately to the author and the post not published. Report flow covers peer content. (Student-UGC risk is now moot — students can't post.)

### 5. Out of scope
Tutoring (M5); any parent/teacher visibility into student dialogue/reflection/personality data (never without an explicit consent feature and its own review); media uploads; direct messages (not in the PRD).

### 6. Dependencies
M2 (safety layer; billing). **OQ5 RESOLVED (D10): in-app, not Skool.** **Still open for Cat:** is the forum free or part of the paid tier (D11 left price/tier unstated), and **who moderates** (PRD §11 staffing still open).

### 7. Implementation plan (condensed; simplified by D11, still needs human review)
Ordered: 0006 migration + RLS tests for the {student = no access, parent/teacher = full forum} rule → role hardening (role now gates reads) → forum feed/composer (adult-only) → report flow → moderation queue → referral codes + attribution → student chat-history UI → safety screening on adult posts → `docs/content-review/m4-for-cat.md` (all UI copy drafts; **community guidelines text does not exist anywhere — Cat must author or approve it before launch**).

### 8. File touchpoints
`supabase/migrations/20260707000006_community.sql` · `app/(app)/community/**` · `app/(app)/dashboard/` (history entry point) · `components/community/**` · `lib/supabase/` (no changes expected) · `tests/rls/**` (matrix), `tests/**` · `docs/content-review/m4-for-cat.md`, `docs/security.md`.

### 9. Data and state implications
First role-gated reads in the system — the `role`-based `posts` policy is the core risk surface (students must get zero rows). Reports and moderation actions must not leak reporter identity to authors. Adult posts are user-generated: safety screen before persist, no analytics on content.

### 10. Testing and verification
RLS tests for the D11 rule: **a student account gets zero `posts` rows and cannot insert; parent/teacher accounts read/write the forum; anon denied.** Report-flow integration tests (reported → hidden pending → restored/removed); referral attribution unit tests; Playwright: post → report → moderate cycle across two adult accounts + a student account proving no forum access; regression: all M1–M3 suites stay green.

### 11. Acceptance criteria
Students provably cannot read or write `posts` (tested); parent/teacher forum works; a reported post disappears pending moderation; referral attribution is recorded and never gates anything; zero student dialogue/reflection/personality data readable by any adult account (re-proven); student chat-history lists only the owner's sessions.

### 12. Risks and open questions
Free-vs-paid tier for the forum + moderation staffing (both still Cat's call, D11); community guidelines content does not exist (Cat must author); the `role` gate is now security-critical (role changes must be server-side + re-reviewed). D11 materially lowers the minors-UGC risk that dominated the earlier plan.

### 13. Handoff notes for Opus 4.8
Do not start M4 without: (a) Cat's free/paid + moderation-staffing calls, (b) human sign-off on this milestone plan, (c) the community-guidelines text from Cat. The privacy invariant is absolute: community features must not create ANY read path into check-ins, reflections, aha moments, or personality data — and per D11, students have no forum access at all.

---

## Milestone 5 — Tutoring matching (PRD Phase 3) — OUTLINE ONLY

> **Gate: requires a dedicated planning pass before execution.** This section records intent and constraints so nothing is accidentally foreclosed earlier.

### 1. Milestone objective
Cat's original vision completed: tutor profiles, personality/needs/interest-based matching, and scheduling — "academics + support + human connection" (PRD §10 Phase 3).

### 2. Source grounding
PRD §3.4 Purpose 3 (quiz → matching), §10 Phase 3, §9 (180-day signals: match acceptance, session completion, school pilot interest); brief §Roadmap; Cat's Blueprint Q&A (tutoring as the original idea, `docs/brand/cats-blueprint-qa.md`).

### 3. Current state
`personality_profiles` exists (raw answers + `quiz_version`; scores null pending OQ2). Nothing else.

### 4. Scope (sketch — to be expanded by the future planning pass)
Tutor role and profiles; matching inputs (personality per the D9/OQ2 rubric + needs + interests); match presentation (PRD §3.4: "the profile informs tone; it never boxes the user in or appears as a label" — no personality labels shown); scheduling and session management; school-tier interplay (OQ4 school-as-provider consent model). **Safeguarding direction (D13, Cat 2026-07-08):** every prospective tutor must pass a **background check (criminal history)** against standards TBD; launch in a **small geographic area / contained user group first, then scale**. (This is the trust-and-safety workstream the earlier draft flagged as unspecified — now it has Cat's direction, though the concrete vetting standards and provider are still to be defined.)

### 5. Out of scope
Everything, until a dedicated plan exists.

### 6. Dependencies
OQ2 rubric (hard blocker); an explicit, revocable consent UX before ANY profile data feeds matching — **PRD §3.4's confidentiality promise ("answers are confidential and used only to enhance the experience… never exposed to parents, teachers, or tutors without explicit consent") makes this a hard requirement, not a preference**; M4 or an equivalent trust layer.

### 7. Implementation plan
Deferred to the dedicated planning pass.

### 8. File touchpoints
Deferred. Expected surface: a tutors domain (`app/(app)/tutoring/**`, new migrations, `lib/matching/`), untouched until planned.

### 9. Data and state implications
Deferred. Known constraint: matching inputs derive from `personality_profiles` only through the consent UX in §6.

### 10. Testing and verification
Deferred; will require its own RLS matrix (tutor role) and consent-flow tests.

### 11. Acceptance criteria
Deferred to the dedicated planning pass.

### 12. Risks and open questions
D9/OQ2 rubric; consent UX for minors sharing profile signals; the concrete tutor **vetting standards + background-check provider** (D13 set the requirement, not the standard); phased-rollout geography (D13); payments for tutoring sessions (unspecified); school distribution consent model (OQ4).

### 13. Handoff notes for Opus 4.8
Do not implement anything M5 without a new approved plan. Until then, protect the enablers: keep `personality_profiles` owner-only, keep raw answers + `quiz_version` intact, and keep `goals`/`aha_moments` clean — they are future matching signals.

---

## Implementation guidance for Opus 4.8

**Sequencing.** M2 → M3 strictly in the order written (within M2: WS1–WS4 before WS5–WS8; WS3's eval before any prompt iteration). M4 and M5 are gated on human review and open-question resolution — do not start them autonomously. Close out M1's pending items (Cat's approvals) as `content:` commits whenever they arrive, independent of where you are in the sequence.

**Branch and PR reality.** `main` now contains the full application (M0/M1 fast-forwarded on 2026-07-07). Work on `claude/trailhead-scaffolding-plan-j36q96` (or its successor), keep commits small and pushed, and land work on `main` via fast-forward/PR keeping the two in sync. Never push to other branches without explicit permission.

**Per-commit validation gate (non-negotiable):** run `pnpm format`, then `pnpm typecheck && pnpm lint && pnpm test && pnpm build` plus `node scripts/check-tokens.mjs` — all green before every commit. CI must stay green on every push.

**Repo safety rules (violations are regressions, not style choices):**
1. **Verbatim IP.** Every Juniper line, option label, quote, and tool string comes character-for-character from `docs/paths/`, `docs/tools/`, `docs/onboarding/` — typographic punctuation preserved. Changes require `pnpm content:lock` in a `content:` commit Cat reviews. Never edit `content/authored.lock.json` by hand. Gaps ship as hidden slots or authored subsets — **never generated dialogue**. Team drafts carry `needsCat: true` plus an entry in the current `docs/content-review/m*-for-cat.md`.
2. **The machine owns flow.** LLM output never selects nodes, skips stages, or invents options (PRD §6.2). Adaptation applies only to `adaptable: true` strings; safety content and reflection quotes are never adapted.
3. **Safety first, literally.** `lib/llm/safety.screen()` runs on ALL user free text before any other processing, on every surface that accepts free text (check-in, community posts, and the hero if it ever accepts text). The lexicon is a floor no classifier may lower. Crisis telemetry stays identifier-free.
4. **Privacy invariants.** RLS enabled in the same migration that creates each table; owner-only on all student data; no parent/teacher read path into dialogue, reflections, aha moments, or personality data — ever, without an explicit consent feature that gets its own review. No analytics, no tracking, no dialogue logging. LLM calls carry session content only.
5. **Red Path double gate.** Never set `FF_RED_PATH` or `RED_PATH_RELEASE_APPROVED` anywhere; the signed `docs/safety/red-path-review.md` is the only key, and only a human turns it.
6. **Boundaries.** LLM SDKs only in `lib/llm/`; Stripe only in `lib/billing/` + its webhook route; hex colors only in `app/globals.css`; no `any`; server-only secrets never `NEXT_PUBLIC_`.
7. **Voice.** Apply the CLAUDE.md when-in-doubt tests to everything user-facing: safe to a stressed 14-year-old; sounds like Juniper, not a product; use Cat's authored words wherever they exist; the simplest version that works. No dark patterns, no urgency mechanics, no timers in dialogue.

**Source-of-truth priority:** repo code → `docs/plans/scaffolding-plan.md` + this buildmap → PRD → brief → CLAUDE.md conventions. When any two disagree, stop and flag it (in the PR description and, if user-facing, in the current review packet) — never resolve silently. When a needed detail exists nowhere, mark it as an Assumption in code comments and the review packet, choose the most conservative reversible option, and continue.
