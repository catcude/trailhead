# Plan: Milestone 1 — Guidepost engine core

## Context

M0 (live skeleton) is complete on `claude/trailhead-scaffolding-plan-j36q96` (PR #1): app scaffold, CI, design tokens, Supabase auth + `profiles` migration with RLS, landing v0, security baseline. M1 builds the product's spine per `docs/plans/scaffolding-plan.md` §M1: the **deterministic Guidepost engine** — versioned verbatim content, a pure state machine, the LLM abstraction with a `verbatim` provider (zero LLM dependency), safety lexicon v0, the `/api/checkin` endpoint, the check-in UI, migration 0002 (all core tables, RLS owner-only), and the skippable Discover Your Path quiz scaffold with scoring stubbed (OQ2).

**Exit criteria (from the approved scaffolding plan):** a full Green check-in completes end-to-end in verbatim mode; unit tests cover every authored branch/fallback; a content-integrity lock protects Cat's verbatim strings; RLS verified by automated policy tests.

**Router copy (G-U1, resolved by Cat this session):** opening line **"How are you feeling today?"** (authored — Red storyboard slide 1). Option labels drafted and marked `NEEDS-CAT`: Green → "I've got energy and a plan in my head", Yellow → "I know what to do but I can't start". Blue/Red options exist in content but are hidden behind flags (`lib/flags.ts` to be added here since M3 needs it anyway for the router).

**IP rule throughout:** every Juniper line in `/content` is entered verbatim from `docs/paths/` (typographic punctuation preserved). Anything I draft (router labels, connective UI microcopy) is marked `NEEDS-CAT` and listed in the PR for Cat's review. Gaps are never filled with generated dialogue.

## Existing code to reuse

- `lib/utils/time.ts` — `checkinVariantForHour()` for the 5–10 PM evening variant.
- `lib/utils/rate-limit.ts` — `RateLimiter` interface + in-memory impl (endpoint hook; Postgres RPC added in 0002).
- `lib/supabase/{server,client,config,routes}.ts` — auth/session plumbing; `/checkin` is already a protected path.
- `components/ui/{button,card,tip-box}.tsx` — check-in UI building blocks.
- `scripts/check-tokens.mjs` pattern for the new content-integrity script.

## Commit sequence (each leaves CI green)

### 1. `feat:` content schema + integrity lock tooling
- `content/schema.ts`: Zod discriminated-union node types — `choice` (options → target node), `freeText` (accepts typed input), `tool` (summons a typed tool with props), `reflection` (quote-bank pick), `message`/`end` — each carrying: `stage` (1–6), verbatim `juniper.text` (+ optional `evening` variant text), `toneTag`, `sourceRef` (doc + section), fallback edges (`idk`, `nothingSoundsRight`, `stillStuck`), `adaptable` flag (LLM may rephrase in M2; always false for safety nodes and reflection quotes).
- `PathContent = { path, contentVersion, entryNodeId, nodes }`; build-time validation test (all edge targets exist, every stage reachable, no orphans).
- `scripts/content-lock.mjs` + `content/authored.lock.json`: sha-256 of every authored string; `tests/content-integrity.test.ts` fails if content changed without regenerating the lock (`pnpm content:lock`) — makes verbatim edits deliberate, reviewed `content:` commits.

### 2. `content:` Green + Yellow verbatim content, quotes, tone rules, router, safety node
- `content/paths/green.ts` — all six stages from `docs/paths/green-path.md`: S1 mind scan + Covey sort (canonical prompt "What are 1–3 things at the top of your mind today?" — G-G3 noted in lock comments), S2 Weekly Horizon alignment + tip-box slot (body copy = gap G-G1, slot ships without body), S3 time check + pop-out slot (G-G2), S4 align day, S5 emotional check-in with all five options incl. the processing-changes walkthrough sequence, S6 goal activation + reflections (standard/evening banks) + evening habit-stacking prompt (verbatim) + "one small thing for tomorrow" evening prompt.
- `content/paths/yellow.ts` — S1 five stuck types (verbatim labels + Juniper's "You're not broken…" response), 2A–2E branches with their verbatim scripts and tool summons, S3 Quick Hit/Chunk It/Full Sprint (+ "Not sure" sub-flow), S4 calendar options, S5 readiness + first-step prompt + under-2-minutes micro-tip, S6 five outcome options + Aha! capture offer.
- `content/quotes/{green,yellow}.ts` — standard + evening banks verbatim (Green's two sets; Yellow's 15-quote set).
- `content/tone/tones.ts` — tone tags → cheat-sheet descriptors (data now; consumed by LLM prompts in M2).
- `content/router.ts` — "How are you feeling today?" + Green/Yellow options (labels `NEEDS-CAT`), Blue/Red entries present but flag-gated.
- `content/paths/mini-reset.ts` — Green + Yellow Mini Reset Toolkits verbatim (fallback target).
- `content/safety/crisis.ts` — safety node: authored boundary line ("I'm not a counselor, but here's someone who can help.") + 988, Crisis Text Line (text HOME to 741741), trusted-adult prompt; `adaptable: false`; microcopy marked `NEEDS-CAT` for Cat's voice pass.
- `lib/flags.ts` — env-driven flags per scaffolding plan §4.5 (incl. the Red double gate).

### 3. `feat:` guidepost state machine (pure, fully unit-tested)
- `lib/guidepost/types.ts` — `SessionState { path, variant, currentNodeId, history, pendingTool? }`, `EngineInput = option | text | toolResult`, `EngineOutput { messages, options, tool?, stage, done }`.
- `lib/guidepost/machine.ts` — `advance(state, input, content)`: pure function; selects standard/evening text via `checkinVariantForHour`; only the machine moves nodes.
- `lib/guidepost/router.ts` — `routeEntry(optionId, flags)`; `lib/guidepost/fallbacks.ts` — "I don't know" → flipped prompt ("What do you *not* want to feel today?" — authored, Green cheat sheet §6), "nothing sounds right" → Mini Reset, still stuck → Weekly Horizon re-anchor + walk/stretch retry (authored).
- Tests (`tests/guidepost/`): full Green traversal standard AND evening (snapshot), every S5 option incl. processing-changes loop; every Yellow branch 2A–2E to completion; all three fallbacks from multiple nodes; flag-gating of Blue/Red router options; no-LLM/no-network guarantee (machine takes content as an argument).

### 4. `feat:` LLM abstraction + safety lexicon v0
- `lib/llm/types.ts` + `lib/llm/provider.ts`: `LLMProvider { chat, stream }`, `getProvider()` from `LLM_PROVIDER`; **`verbatim` provider** (chunks authored text through the stream interface); `anthropic`/`openai` entries throw "not configured in M1" (SDKs land in M2 — no SDK imports outside `lib/llm/` stays trivially true).
- `lib/llm/safety.ts`: `screen(text): { ok: true } | { ok: false, category }` — deterministic word-boundary lexicon (self-harm, abuse, immediate danger; conservative, case/leet-tolerant), category → safety node id. Unit tests with a red-team fixture set (matches + near-miss negatives like "homework is killing me" calibrated conservatively — false positives acceptable, false negatives not).

### 5. `infra:` migration 0002 — core tables with RLS + rate-limit RPC; RLS tests in CI
- `supabase/migrations/20260707000002_guidepost_core.sql`: `personality_profiles` (raw_answers jsonb, five nullable score columns, quiz_version), `chat_sessions` (path, variant, current_node, state jsonb), `chat_messages` (session_id, role, content, stage — owner via session join), `reflections`, `aha_moments`, `habits`, `habit_checks`, `goals`, `weekly_horizons` — **RLS enabled + owner-only policies in this same migration**, per-table indexes; `check_rate_limit(p_key text, p_limit int, p_window_ms int)` security-definer function so limits hold across serverless instances without service-role plumbing.
- `tests/rls/policies.test.ts` (vitest, runs only when `SUPABASE_TEST_URL` is set): two seeded users; user A cannot select/insert/update B's rows on any table; anon fails everywhere; chat_messages unreachable via foreign session.
- CI: new `rls` job — `supabase/setup-cli` action, `supabase db start`, apply migrations, run the RLS suite (Docker exists on GitHub runners; locally the suite skips unless the env var is set).
- Update `docs/security.md` rows (RLS tests ✅, Postgres rate limit ✅).

### 6. `feat:` `/api/checkin` endpoint
- `app/api/checkin/route.ts` (POST), per scaffolding plan §3.3 order: auth → rate limit (`check_rate_limit` RPC, per-user + per-IP; gentle 429 copy) → parse body (Zod: `{ sessionId?, input, clientLocalHour }`) → load/create `chat_sessions` → **safety screen first on any free text** (on crisis: transition to safety node, persist, return — nothing else runs) → `advance()` → persist `chat_messages` + session state (+ `reflections` row when a reflection node completes) → respond.
- Response: SSE stream — `token` events (verbatim provider chunks) then one `state` event `{ nodeId, stage, options, tool?, done }`. 503 with friendly copy when Supabase unconfigured.
- Route-level tests for body validation + safety short-circuit (engine logic already covered in unit tests).

### 7. `feat:` check-in UI
- `app/(app)/checkin/page.tsx` (client) + `components/guidepost/`: `MessageStream` (renders SSE tokens), `OptionPicker` (thumb-reach buttons, min-h-11), `FreeTextInput`, `StageDots` (no time pressure — no timers anywhere), reflection picker; sends `clientLocalHour` for the evening variant.
- Minimal-but-real tool components in `components/tools/` (M2 polishes them): `CoveyQuadrantSorter` (add items → assign to the four quadrants — needed by Green S1 and Yellow 2C) and `MiniResetToolkit` (authored options + verbatim re-entry prompt — fallback target). Tool results post back as `toolResult` input.
- Dashboard "Daily check-in" card links to `/checkin`.
- Accessibility: focus states, reduced-motion already global, one-thumb at 375px.

### 8. `feat:` Discover Your Path quiz scaffold
- `content/quiz/big-five.ts` — 25 A/B/C questions verbatim from `docs/onboarding/big-five-quiz.md`.
- Onboarding step after role/display-name: offer quiz with **"Explore the App First"** skip (always); confidentiality promise shown in UI ("used only to shape the experience"), backed by owner-only RLS.
- Answers persist to `personality_profiles` (raw_answers + quiz_version; scores stay null). `lib/personality/scoring.ts` — `scoreQuiz()` interface stubbed pending OQ2 rubric; `FF_QUIZ_SCORING` off. Retake supported (upsert).

### 9. `docs:` M1 wrap-up
- Update `docs/plans/scaffolding-plan.md` (M1 → done, checkboxes) and `docs/security.md`.
- `docs/content-review/m1-for-cat.md`: consolidated review packet — router labels + all NEEDS-CAT microcopy with file locations, the shipped-without-body slots (G-G1 tip box, G-G2 pop-out), and the open gaps that block M2 polish (G-Y1..4, G-T1..3).

## Verification

- Every commit: `pnpm typecheck && pnpm lint && pnpm test && pnpm build` + `node scripts/check-tokens.mjs`.
- Machine coverage: traversal tests touch every node/edge of Green + Yellow (validation test asserts no unreachable nodes; fallbacks tested from multiple stages).
- Content integrity: mutate a string locally → lock test fails; `pnpm content:lock` + `content:` commit path documented.
- If Docker is available in this sandbox: `supabase db start`, apply migrations, run the RLS suite and a full E2E Green check-in (sign-up → onboarding → quiz skip → six stages → reflection persisted) with Playwright, screenshots to Cat. If not: RLS + E2E run in the CI `rls` job and on Vercel preview once Cat's keys exist (SETUP.md); sandbox verification = unit suite + API route tests + UI smoke with mocked fetch.
- Push after each commit (or small batches) to update PR #1.

## Out of scope (M2)
LLM adaptivity (real provider + prompts + tone eval), full tool polish (Aha! tracker UI, Start Small Planner, Micro-Needs Menu, Evening Wind Down), dashboard tools, Stripe billing, interactive landing hero, safety classifier second pass.
