# Trailhead — Scaffolding Plan

**Status:** Draft for review — do not implement until approved
**Author:** Claude Code session, 2026-07-07
**Scope:** Repo scaffold → live Phase-1 deployment (Green + Yellow end-to-end) → Blue/Red scaffolds behind flags
**Canonical sources:** `CLAUDE.md`, `docs/Trailhead_PRD`, `docs/Trailhead_Product_Brief`, the four path docs, `reusable-tools-masterlist`, `onboarding` (Big Five quiz), Cat's Blueprint Q&A

---

## 0. Source-document conflicts (flagged, not guessed)

Per CLAUDE.md's own rule ("when this file and the PRD conflict, flag it, don't guess"):

| # | Conflict | Where | Recommended resolution (needs confirmation) |
|---|---|---|---|
| C1 | Red Path spec status: CLAUDE.md says "spec incomplete — do not build without Cat's source doc and safety review"; PRD says "Red spec is now complete; ship only after dedicated safety review" | CLAUDE.md §Source Documents vs PRD §11 | PRD is newer and a full Red doc exists in the repo. **Scaffold Red behind a hard feature flag; safety review is the release gate.** Update CLAUDE.md after Cat confirms. |
| C2 | Palette: CLAUDE.md Design Principles say "warm neutrals + trail-green accent"; PRD §5.1 confirms the Patagonia palette (coral/orange primary) and explicitly marks the earthier palette as rejected | CLAUDE.md §Design Principles vs PRD §5.1 | **Use the Patagonia palette** (PRD is explicit that it's confirmed). Propose a CLAUDE.md correction PR. |
| C3 | Repo layout: CLAUDE.md references `/docs/paths/*.md`, `/docs/tools/reusable-tools.md`, `brand-voice-report.md` — none exist. Actual content lives as `.txt` files at repo root (`greenpath.txt`, etc.) | Repo state | **Normalize in M0**: move source docs verbatim into `docs/paths/`, `docs/tools/` (a `content:` commit, byte-identical text). Flag that `brand-voice-report.md` does not exist — the Q&A + CLAUDE.md voice sections stand in for it. |
| C4 | `chatbot.txt` recommends Rasa/BotPress/Dialogflow and open-ended NLP chat | chatbot.txt vs CLAUDE.md/PRD hybrid model | **Treat as historical research, superseded.** The confirmed architecture is the deterministic state machine + authored content + LLM adaptation layer. No chatbot platform. |
| C5 | Red Path doc internal inconsistencies: (a) two different Stage 6 quote sets (one shared with Green, one "Updated for Emotional Resilience"); (b) the cheat sheet includes Green's "processing changes" Stage 5 special case | redpath doc | Scaffold both quote banks as versioned content, **ask Cat which is canonical** before Red ever unflags. Storyboard slides 9–10 suggest the processing-changes case *is* intended in Red — confirm. |
| C6 | FlutterFlow storyboards | PRD §11 | Already resolved by PRD: **design references only**; stack is Next.js App Router + Tailwind + Supabase + Stripe on Vercel. |

---

## 1. Guiding constraints

1. **Live-first.** Milestone 0 ends with a deployed production URL. Every milestone after keeps `main` deployable.
2. **Guidepost is a deterministic state machine with authored content.** The LLM adapts phrasing, interprets free text, selects among authored variants. It never owns flow, skips stages, or invents content. The engine must be fully testable with the LLM off.
3. **Cat's dialogue is IP, implemented verbatim.** All authored strings live in `/content` as versioned data with a CI integrity check. Gaps are flagged (Section 6), never filled with generated text.
4. **Assume minors.** RLS-first, data minimization, no behavioral analytics, no data sale, COPPA/FERPA-aware posture, safety layer before any free-text reaches the LLM.
5. **Red Path is safety-gated.** Scaffolded, flagged off in every environment, cannot ship without the dedicated safety review (`docs/safety/red-path-review.md` sign-off is the gate).

**Every milestone review applies CLAUDE.md's "when in doubt" tests as exit criteria:**
- Would this feel safe to a stressed 14-year-old?
- Does this sound like Juniper or like a product?
- Is this in Cat's authored content already? (If yes, verbatim.)
- Is this the simplest version that works?

---

## 2. Milestone sequencing

### Overview table

| Milestone | Days | Theme | Deployed & demoable at exit |
|---|---|---|---|
| **M0 — Live skeleton** | 1–3 | Repo, CI/CD, auth, tokens, landing v0 | Production URL on Vercel: landing page in the Patagonia design system; sign up / sign in (email + Google); protected empty dashboard. Preview deploys on every PR. |
| **M1 — Guidepost engine core** | 3–9 | State machine, content model, LLM abstraction, core schema | A complete Green check-in (all six stages, verbatim content, **no LLM required**) on production; unit-tested path router + stage machine; all core tables live with RLS. |
| **M2 — Green + Yellow end-to-end (Phase 1)** | 9–22 | Full fidelity, LLM adaptivity, tools, safety v1, billing | PRD Phase 1: Green + Yellow with all branches, evening variants, fallbacks, Mini Reset Toolkit, quote banks, Aha! + Habit trackers, safety layer v1, freemium billing, tone eval v0 in CI. |
| **M3 — Blue + Red scaffolds (flagged)** | 22–30 | Path permeability, flagged scaffolds, safety-review gate | Blue + Red flows complete behind flags (visible only with flag cookies/envs in preview); mid-flow permeability working; Red release gate documented. Production unchanged for users. |

### M0 — Live skeleton (days 1–3)

**Deliverables**
- Repo scaffold: Next.js (App Router) + TypeScript `strict` + Tailwind; pnpm; ESLint + Prettier; Vitest wired with one real test. Folder skeleton exactly per CLAUDE.md (Section 3.1).
- Design tokens: Patagonia palette (`#F9A971` Sunset Coral, `#FB6526` Bright Orange, `#0165A5` Deep Sky Blue, `#A68DEB` Soft Lavender, `#3B2089` Rich Indigo, `#4A4A4A` Charcoal, `#D0B280` Golden Sand) as Tailwind theme tokens / CSS variables — **never hardcoded hex in components**. Type scale, card, button primitives in `components/ui/`.
- Supabase project(s) + Auth: email/password + Google OAuth; SSR helpers; middleware-protected `(app)` route group; migration 0001: `profiles` (role enum student/parent/teacher, display_name) with RLS.
- Marketing landing page v0 in `(marketing)`: static, honest, mobile-first at 375px, copy drawn from the brief/CLAUDE.md examples ("Try it. No tricks, no pressure."), placeholder slots explicitly marked `<!-- NEEDS-CAT -->` where hero-interactive copy is unauthored. The interactive hero ships in M2 (it needs the engine); v0 must still not look like boilerplate.
- CI/CD: GitHub Actions pipeline (Section 4.1) green; Vercel project with preview deploys per PR + production from `main`; branch protection on `main`.
- Docs normalization (`content:` commit): source `.txt` files moved verbatim to `docs/paths/`, `docs/tools/`, `docs/onboarding/`; `claude.md` → `CLAUDE.md`.
- Security baseline: security headers, `.env.example`, secrets policy documented, dependency audit in CI.

**Exit criteria:** production URL live; PR → preview deploy → merge → prod deploy loop demonstrated; auth round-trip works on production; CI blocks a PR with a type error; no hex literals outside the token file; the four when-in-doubt tests pass on the landing page.

**Dependencies:** Vercel + Supabase + Google OAuth credentials; GitHub repo settings access.

### M1 — Guidepost engine core (days 3–9)

**Deliverables**
- **Content model** (`/content`): Zod-validated schema for path content — nodes keyed by `path/stage/node-id`, each carrying verbatim authored text, user options, branch targets, fallback edges, tone tags, tool summons, standard/evening variants, `content_version`. Green + Yellow entered verbatim from `docs/paths/`; quotes in `/content/quotes` (standard + evening banks per path); tone rules in `/content/tone` transcribed from the cheat sheets.
- **State machine** (`lib/guidepost/`): pure, deterministic `advance(state, input, content) → { nextNode, options, toolSummon?, toneTag }`. Path router for entry check-in (Green/Yellow live; Blue/Red options behind flags). Fallback logic as specced: "I don't know" flips the prompt; "nothing sounds right" offers a micro-reset; still stuck re-anchors to Weekly Horizon. Unit tests cover every stage transition, every Yellow 2A–2E branch, every fallback, evening variant switching — **no LLM, no network**.
- **LLM abstraction** (`lib/llm/provider.ts`): `LLMProvider` interface per CLAUDE.md (chat + stream), provider chosen by `LLM_PROVIDER` env, no SDK imports outside `lib/llm/`. Includes a **`verbatim` provider** (returns authored text unchanged) so the whole product runs with zero LLM cost/dependency — this is the M1 demo mode and the permanent deterministic fallback.
- **Safety stubs** (`lib/llm/safety.ts`): `screen(text) → { ok } | { crisis, category }` interface + deterministic lexicon v0 + authored-safety-node wiring point; full v1 in M2.
- **`/api/checkin`** endpoint (Section 3.3) with streaming, session persistence, rate-limit hook.
- **Check-in UI** (`components/guidepost/`): message stream, option picker, tip box, stage-aware layout; one-thumb operable at 375px.
- **Migration 0002:** `personality_profiles`, `chat_sessions`, `chat_messages`, `reflections`, `aha_moments`, `habits`, `habit_checks`, `goals`, `weekly_horizons` — RLS owner-only on all (Section 3.5).
- **Discover Your Path quiz scaffold:** questions verbatim in `/content/quiz` (from the Big Five doc), skippable ("Explore the App First"), answers stored owner-only with `quiz_version`; `lib/personality/scoring.ts` interface stubbed — **scoring rubric is an open blocker (OQ2)**, so no scores are computed or shown yet.

**Exit criteria:** a full Green check-in completes on production in verbatim mode; state-machine test suite ≥ every authored branch/fallback; content integrity test locks authored strings; RLS verified by automated policy tests (user A cannot read user B's rows, anon reads fail).

**Dependencies:** M0. No LLM provider decision required (verbatim mode).

### M2 — Green + Yellow end-to-end, Phase 1 complete (days 9–22)

**Deliverables**
- **Full Green fidelity:** Covey sort in Stages 1–2, Weekly Horizon alignment (requires minimal Weekly Horizon create/view so fallbacks and Stage 2 have a real anchor), time/calendar Stages 3–4 (manual in-app day sketch — see OQ3), Stage 5 tone recalibration incl. the "processing changes" walk-through, Stage 6 reflections + evening variant (5–10 PM local) + habit-stacking nudge (evening only, per the cheat sheet).
- **Full Yellow fidelity:** five 2A–2E branches with their tools (2A body reset, 2B ground-or-carry, 2C brain dump + Covey sort + Zoom-Out, 2D resistance naming + micro-starts, 2E one tiny action), Quick Hit / Chunk It / Full Sprint sizing, Stage 4 calendar options, Stage 5 readiness, Stage 6 outcome-matched quotes + Aha! capture.
- **In-dialogue tools** (`components/tools/`, structured UI summoned by nodes, never text blobs): Covey Quadrant Sorter, Mini Reset Toolkit, Start Small Planner, Aha! Moment Tracker, Micro-Needs Menu, Evening Wind Down prompts. Built once, reused across paths and dashboard.
- **Dashboard v1:** Habit Tracker (+ gentle streak display), Aha! log, Weekly Horizon minimal, reflections history.
- **LLM adaptivity on:** provider per OQ1; Juniper persona + tone-rule prompts in `lib/llm/prompts/`; LLM restricted to (a) rephrasing authored text to the calibrated tone, (b) interpreting free text into structured selections, (c) the plan-change "why" explanation grounded in the user's own session data. Streaming end-to-end.
- **Safety layer v1** (`lib/llm/safety.ts`): deterministic crisis lexicon runs on all free text **before** any LLM call; optional second-pass LLM classifier; on trigger the state machine transitions to an authored safety node — flow paused, 988 + Crisis Text Line + trusted-adult prompts in Juniper's steady voice, "I'm not a counselor, but here's someone who can help." Non-identifiable telemetry only (Section 5).
- **Freemium billing:** Stripe checkout + customer portal (cancel in two taps from settings), webhook with signature verification, entitlement check in `/api/checkin`. Free tier limit per OQ6.
- **Tone regression eval v0 in CI** (Section 4.4).
- **Interactive landing hero:** the real engine in a sandboxed, no-auth, no-persistence mode; "How it works" section shows the Yellow Stage 1 → 2D exchange verbatim.

**Exit criteria:** PRD Phase 1 checklist green; a stressed-14-year-old review pass on every screen; safety layer verified with a red-team prompt set; Stripe test-mode E2E (subscribe → entitled → cancel in two taps); tone eval running in CI; Playwright smoke: full Green + Yellow check-ins on preview.

**Dependencies:** M1; LLM provider decision (OQ1); Stripe account; content gaps G-list (Section 6) resolved by Cat **or** shipped with authored-content-only subsets (gaps hidden, never generated).

### M3 — Blue + Red scaffolds behind flags (days 22–30)

**Deliverables**
- **Blue Path** complete behind `FF_BLUE_PATH`: all six stages verbatim, Mood-Matching Visual + Micro-Needs Menu + Gentle Focus Anchor summons, **Stage 3 mismatch permeability** (head full → Yellow, heart loud → Red*, body tired → Micro-Needs Menu, "I don't know" → stay Blue) and **Stage 6 re-entry** (→ Yellow / → Green / grounding close). *Heart-loud → Red routes to the authored safety-forward interim ("grounding exit") while Red is gated: Blue must never dead-end — exact interim behavior needs Cat's sign-off (G-B4).
- **Red Path** complete behind `FF_RED_PATH` + `RED_PATH_RELEASE_APPROVED` double gate: Stage 1 regulation-first, 1B emotional check-in, Stage 2 weight-naming, Stage 3A/3B plan-vs-Mini-Reset branch, **regulated shift to Green/Yellow**, Stage 4 Covey (Do Now / Do Later / Delegate / Drop), Stage 5 re-scope, Stage 6 resilience reflections. Tightest safety integration: lower crisis-screen thresholds, grounding exits at every stage.
- **Mid-flow path shift mechanics** in the router (session keeps history; shifted-into path resumes at its correct stage per the docs).
- **Red safety review gate:** `docs/safety/red-path-review.md` template — reviewer, crisis-handling test transcripts, escalation-threshold sign-off, legal check. The `RED_PATH_RELEASE_APPROVED` env is documented as settable only after this doc is signed. CI check: red content loader refuses to serve Red nodes in production builds without both gates.
- Streak System, Goal Microflow, Progress Reflection tools (weekly pattern prompts + habit-loop templates from the path docs) — dashboard, behind `FF_DASHBOARD_EXTRAS` until copy is confirmed.

**Exit criteria:** flags off = production byte-identical for users; flags on in preview = full Blue/Red walkthroughs demoable to Cat; permeability unit + E2E tested; Red gate documented and enforced by CI; open Red content questions (C5, G-R list) delivered to Cat as a single review packet.

**Dependencies:** M2; Cat's availability for Blue/Red content review; safety reviewer identified (risk R2).

---

## 3. Architecture

### 3.1 Directory structure (per CLAUDE.md, confirmed)

```
/
├── docs/                        # Canonical sources (normalized in M0)
│   ├── paths/ · tools/ · onboarding/ · plans/ · safety/
├── app/
│   ├── (marketing)/             # Landing, about, pricing — public
│   ├── (app)/                   # Authenticated
│   │   ├── dashboard/ · checkin/ · settings/ · community/(Phase 2 stub)
│   ├── auth/                    # Sign in/up, OAuth callback
│   └── api/
│       ├── checkin/             # Engine endpoint (state machine + LLM proxy)
│       └── webhooks/stripe/
├── components/
│   ├── ui/ · marketing/ · guidepost/ · tools/
├── content/
│   ├── paths/                   # green.ts yellow.ts blue.ts red.ts — verbatim, versioned
│   ├── quotes/ · tone/ · quiz/ · safety/   # safety = authored crisis-response nodes
├── lib/
│   ├── supabase/ · guidepost/ · personality/
│   ├── llm/                     # provider.ts · prompts/ · safety.ts
│   ├── flags.ts · utils/
├── supabase/migrations/
├── tests/                       # unit (Vitest) + e2e (Playwright) + evals/tone
└── .github/workflows/
```

### 3.2 Engine ↔ content ↔ LLM division of labor

- **Content** (`/content`) is data: every node's authored text, options, edges, tone tag, tool summon, variant. Zod-validated at build; authored strings locked by a CI integrity snapshot (changes require a `content:` commit reviewed via CODEOWNERS — protects verbatim IP).
- **State machine** (`lib/guidepost/`) owns all flow. It is a pure function over (session state, user input, content). LLM output can never select the next node, skip a stage, or alter options.
- **LLM** (`lib/llm/`) has exactly three jobs: tone-adapt authored phrasing (node opt-in; verbatim mode always available), interpret free text into structured engine input, and generate the grounded plan-change explanation. All calls flow through `provider.ts`; `LLM_PROVIDER=verbatim|anthropic|openai`.

### 3.3 `/api/checkin` request flow

```
POST /api/checkin  { sessionId?, input, clientLocalHour }
  input = { type:"option", optionId } | { type:"text", text } | { type:"tool_result", toolId, payload }
```

1. **Auth** — Supabase SSR session; 401 otherwise.
2. **Rate limit** — per-user and per-IP (Section 5); 429 with gentle copy.
3. **Entitlement** — free-tier limit check (OQ6); soft paywall response if exceeded.
4. **Session** — load or create `chat_sessions` row (path, `variant` = evening iff local hour in 17–22, current node, state JSONB).
5. **Safety screen (free text only, always first)** — `safety.screen(text)`: deterministic lexicon, then optional LLM classifier. On crisis: state machine transitions to the authored safety node; flow paused; resources streamed; aggregate-only telemetry; **nothing else runs**.
6. **Advance** — `advance(state, input, content)` returns next node, options, tone tag, optional tool summon. Free text that a node accepts (e.g., 2C brain dump) is first mapped to structured items by the LLM, then fed to the engine.
7. **Render** — if the node allows adaptation and provider ≠ verbatim: stream LLM rephrasing constrained by Juniper persona + tone rules + (post-rubric) personality calibration; else stream authored text as-is.
8. **Persist** — append `chat_messages` (role, content, stage), update session state; reflections/aha/habit choices write to their tables.
9. **Respond** — SSE stream of message tokens, then a terminal structured frame: `{ nodeId, stage, options[], tool?: { type, props } }`.

**Tools as structured UI:** the terminal frame's `tool` field maps to a typed component in `components/tools/` (CoveyQuadrantSorter, MiniResetToolkit, StartSmallPlanner, AhaTracker, MicroNeedsMenu, MoodMatchingVisual, GentleFocusAnchor, EveningWindDown). Tool results post back as `tool_result` input. Never rendered as text blobs.

### 3.4 Schema plan (migrations 0001–0003)

RLS enabled on **every table from the migration that creates it**; owner-only (`auth.uid() = user_id`) on all student data; service role used only in server code; no parent/teacher read paths exist at all.

| Table | Key fields | RLS |
|---|---|---|
| `profiles` | id (auth FK), role, display_name, created_at | owner read/write; role changes server-only |
| `personality_profiles` | user_id, raw answers JSONB, five scores (nullable until rubric), quiz_version, taken_at | **owner-only, no exceptions** — feeds tone + Phase-3 matching |
| `chat_sessions` | user_id, path, variant, current_node, state JSONB, started/ended_at | owner-only |
| `chat_messages` | session_id, role, content, stage, created_at | owner-only via session join — continuity, not surveillance |
| `reflections` | user_id, session_id, quote_id / free text, outcome_tag | owner-only |
| `aha_moments` | user_id, text, tag, source_session | owner-only |
| `habits` / `habit_checks` | self-selected habits; checks; streak with gentle reset | owner-only |
| `goals` | user_id, horizon (short/mid/long), category, title, status | owner-only |
| `weekly_horizons` | user_id, week_start, intentions JSONB | owner-only |
| `billing_customers` / `subscriptions` (0003) | user_id ↔ stripe ids; status cache | owner read; server-only write |
| `safety_events` (0003) | trigger_category, path, stage, day-granularity timestamp — **no user_id, no text** | server-only insert; aggregate reads for weekly review |

### 3.5 Discover Your Path quiz scaffold

- Questions verbatim in `/content/quiz/big-five.ts` (25 A/B/C scenario questions across the five dimensions).
- Skippable at onboarding ("Explore the App First"); retakable; the UI carries the confidentiality promise and the data model backs it (owner-only RLS).
- `lib/personality/`: `scoreQuiz(answers, rubricVersion)` interface defined; **implementation stubbed** — raw answers + `quiz_version` are stored so scores are computable retroactively once the rubric lands. Nothing downstream consumes scores until then; profile never appears as a label in dialogue.
- **Blocker flagged:** scoring rubric (A/B/C → dimension scores → concrete Juniper tone adjustments) is OQ2 and blocks the *full* build, not the scaffold.

---

## 4. CI/CD

### 4.1 GitHub Actions (every PR + main)

Jobs (pnpm, cached): **typecheck** (tsc strict, no `any` — enforced also by `@typescript-eslint/no-explicit-any` error) → **lint** → **unit tests** (state machine, path routing, fallbacks, safety lexicon — the guarded core) → **content validation** (Zod schemas + authored-string integrity snapshot) → **build** → **migration check** (migrations apply cleanly to a disposable local Supabase; `db diff` drift check) → **dependency audit** (`pnpm audit` + Dependabot) → **tone eval v0** (path-filtered: runs when `lib/llm/prompts/**` or `content/tone/**` change). Branch protection on `main`: required checks, PR reviews, no direct pushes.

### 4.2 Vercel & environment strategy

- Preview per PR; production from `main` only.
- **Preview env:** staging Supabase project, Stripe test keys, `LLM_PROVIDER=verbatim` by default (previews cost nothing; flip per-branch when testing adaptivity). **Production env:** prod Supabase, live Stripe, chosen provider.
- **Server-only (never `NEXT_PUBLIC_`):** `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LLM_API_KEY`. Public: Supabase URL + anon key, Stripe publishable key. CI greps for leaked server secrets in client bundles.

### 4.3 Supabase migration workflow (no drift)

Two projects: **staging** (serves all previews) and **prod**. Flow: local `supabase migration new` against local stack → PR (CI applies to disposable DB + drift check) → merge to `main` → Action runs `supabase db push` to staging → smoke test → GitHub Environment approval gate → push to prod. Schema changes ship one deploy ahead of code that needs them (expand/contract). Supabase branching noted as a future upgrade (OQ8).

### 4.4 Tone regression eval suite (v0 in CI)

- **v0 (deterministic, free, blocking):** lint every user-facing string and every LLM prompt/persona file against (a) banned lexicon from CLAUDE.md (clinical: "disorder", "deficit", "intervention", "diagnose"; ed-tech: "gamified", "unlock your potential", etc.), (b) required boundary phrases in safety nodes, (c) reading-level ceiling (≈ grade 8) on Juniper strings, (d) verbatim-integrity snapshot.
- **v0.5 (LLM-as-judge, non-blocking, key-gated):** golden set of check-in exchanges per path/stage; judge scores outputs against the tone cheat sheets ("safe to a stressed 14-year-old", tone-tag conformance); report on PRs touching prompts; promoted to blocking once calibrated. Runs before any prompt change ships — this is the PRD's "reliability of tone" requirement.

### 4.5 Feature flags

`lib/flags.ts` — env-driven, no vendor: `NEXT_PUBLIC_FF_BLUE_PATH`, `FF_RED_PATH` (server-checked), `FF_DASHBOARD_EXTRAS`, `FF_QUIZ_SCORING`. Red additionally requires `RED_PATH_RELEASE_APPROVED`, documented as settable only after the signed safety review; a CI/build assertion keeps Red unreachable in production without both. Flags checked in the router and content loader, not sprinkled through components.

---

## 5. Security & privacy checklist (non-negotiable; users assumed minors)

- [ ] RLS on every table in the same migration that creates it; automated policy tests (cross-user + anon access must fail) in CI.
- [ ] **No parent/teacher visibility into student dialogue, reflections, quiz answers, or personality profiles — no such query path exists.** Any future consent-based sharing is a new, explicit, opt-in feature with its own review.
- [ ] Data minimization: signup = email + password (or Google) only; onboarding adds display name + role; no DOB, phone, address, school. 13+ age attestation at signup; parental-consent flow slot reserved in onboarding for under-13/school distribution (**region specifics = OQ4, needs legal input**).
- [ ] Safety v1: lexicon screen before any LLM call; flow pause + authored resources (988, Crisis Text Line, trusted-adult prompt) in Juniper's steady voice; never diagnose/prescribe/attempt therapy; Blue/Red always offer grounding exits; reflective-depth caps.
- [ ] Safety telemetry non-identifiable: category/path/stage/day only — no user_id, no text, ever; weekly review query per PRD guardrail.
- [ ] No behavioral ad tracking, no third-party analytics SDKs, no per-student behavioral analytics, no data sale. If aggregate product metrics are ever needed → privacy-preserving counts only, separate decision.
- [ ] Secrets: server-only keys never `NEXT_PUBLIC_`; `.env.example` documents ownership; bundle-leak check in CI; Dependabot + audit gate.
- [ ] Security headers (next.config): strict CSP (self-only — no third-party scripts exist), HSTS, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy.
- [ ] Rate limiting on `/api/checkin` (+ auth endpoints): per-user and per-IP fixed-window limiter backed by Postgres (no new vendor at MVP scale; swappable interface — OQ7).
- [ ] Stripe: webhook signature verification, idempotent handlers, no card data touches our servers, cancel-in-two-taps via Customer Portal.
- [ ] LLM data hygiene: provider calls carry session context only (no email/name); provider chosen with no-training-on-inputs terms (OQ1).

---

## 6. Per-path fidelity matrix & authored-content gaps

**Rule applied throughout: gaps are flagged for Cat — never filled with generated text.** Where a gap blocks a node, the node ships hidden or with the authored subset only.

| Path | Spec element (from path doc) | Plan | Status |
|---|---|---|---|
| **Green** | 6 stages; Covey sort (S1–2); Weekly Horizon alignment; calendar/time S3–4; S5 tone recalibration + processing-changes walkthrough; S6 reflections std/evening; habit stacking (evening); Mini Reset Toolkit; quote banks | All implemented M1–M2, verbatim | ✅ plan covers; gaps G-G1..G-G5 |
| **Yellow** | S1 five stuck types; 2A–2E branches; Quick Hit/Chunk It/Full Sprint; S4 calendar options; S5 readiness; S6 outcome-matched quotes + Aha!; Zoom-Out; Mini Reset; habit anchors; weekly patterns | All implemented M2, verbatim | ✅ plan covers; gaps G-Y1..G-Y4 |
| **Blue** | Surface scan honoring "I'm fine"; vibe-check metaphors; S3 head/heart/body mismatch → Yellow/Red/stay; Micro-Needs Menu; S5 reorientation tools; S6 closure/re-entry (→Yellow/→Green/grounding); reflection tags | Implemented M3 behind flag, incl. permeability | ✅ plan covers; gaps G-B1..G-B4 |
| **Red** | Regulation-first S1 + 1B; S2 weight; S3A plan / 3B Mini Reset (ask-for-help scripts, deadline-reality check); regulated shift → Green/Yellow; S4 Covey Do Now/Later/Delegate/Drop; S5 re-scope; S6 resilience reflections; safety integration | Scaffolded M3 behind double gate; safety review = release gate | ⛔ gated; gaps G-R1..G-R5 + C5 |
| **Cross-path** | Fallbacks ("I don't know" flips prompt; "nothing sounds right" → micro-reset; still stuck → Weekly Horizon); std/evening variants (5–10 PM); tone recalibration table; tools as structured UI | In the engine core (M1) and content schema | ✅ plan covers; gap G-U1 |

### Gaps needing Cat's input (content review packet, grouped by when they block)

**Blocks M1–M2 (Green/Yellow/universal):**
- **G-U1** — The universal entry check-in (the router): framing line + the four state options a user picks from. Fragments exist (Red storyboard: "How are you feeling today?"; Green: "Hey there 👋 Let's set today up with clarity."), but no canonical router script.
- **G-G1** — Stage 2 tip-box body copy (urgent-vs-important teen examples) — described, not authored.
- **G-G2** — Stage 3 Pomodoro / time-blocking pop-out copy — described, not authored.
- **G-G3** — Stage 1 prompt variant: "1–3 things" vs "3 things" — confirm canonical.
- **G-G4** — Stage 4 tip: "Cohesion = Flow = Less Stress" vs "Real-life alignment reduces overwhelm and builds flow" — confirm which is UI-facing.
- **G-G5** — "Vision video / dream mind map" (rewatch prompt): feature undefined — scaffold as optional link slot; needs definition.
- **G-Y1** — 2D tailored micro-start ideas per resistance type (fear of failure / perfectionism / boredom) — not enumerated.
- **G-Y2** — 2B one-minute grounding/naming exercise script — not authored.
- **G-Y3** — Zoom-Out Exercise content — referenced, no doc.
- **G-Y4** — Stage 6 outcome → reflection-quote mapping — bank exists; mapping unspecified.
- **G-T1** — Gentle Focus Anchor and Start Small Planner interior copy — one-line descriptions only.
- **G-T2** — Micro-Needs Menu: close the "etc." — full item list + per-item Juniper responses.
- **G-T3** — Streak gentle-reset messaging; universal Evening Wind Down set (Green's exists; others?).
- **G-L1** — Landing hero interactive script (opening line + gentle adaptive responses) and problem/solution section copy — direction exists; final copy needs Cat (we draft, she approves, marked `draft-for-cat` until then).
- **G-O1** — Onboarding welcome + role-selection copy; quiz intro/outro in Juniper's voice.

**Blocks M3 (Blue/Red unflagging):**
- **G-B1** — Stage 2: tailored Juniper responses per metaphor (numb / autopilot / boxed in / faking it / managing) — "tailored responses" noted, not authored.
- **G-B2** — Mood-Matching Visual content (color wheel / metaphor deck / body map items).
- **G-B3** — Stage 6 grounding breath + affirmation script.
- **G-B4** — While Red is gated: authored interim for Blue's "heart loud" hand-off (grounding exit copy) — needs Cat's sign-off.
- **G-R1** — Stage 2 canonical weight options (storyboard's six quick-taps vs open prompt).
- **G-R2** — Ask-for-help scripts — named, not authored.
- **G-R3** — "Is this deadline actually real?" dialogue — not authored.
- **G-R4** — Canonical Stage 6 quote set (see C5a) and whether processing-changes belongs in Red Stage 5 (C5b).
- **G-R5** — Red-specific escalation thresholds (when Red hands to the safety layer) — safety-review scope.

---

## 7. Assumptions & open-questions register

Recommended defaults so work isn't blocked — **all marked for Cat/team to confirm or override.**

| # | Open question (PRD §11) | Recommended default (assumption) | Blocks |
|---|---|---|---|
| OQ1 | LLM provider + cost model | **Anthropic**, small fast model for tone adaptation + free-text interpretation + safety second-pass, via the abstraction layer; per-check-in token budget enforced in `provider.ts`; `verbatim` mode is the permanent cost lever (free tier can run partially verbatim). No training on inputs per API terms. | M2 adaptivity only — M0/M1 proceed regardless |
| OQ2 | Quiz scoring rubric | Scaffold interface + store raw answers with `quiz_version`; compute nothing until Cat delivers the A/B/C→score→tone-adjustment rubric. `FF_QUIZ_SCORING` off. | Full quiz build; not the scaffold |
| OQ3 | Calendar integration depth (S3–4) | **v1: manual in-app "sketch your day"** (no Google Calendar OAuth — smaller privacy surface for minors, faster ship). Read-only Google Calendar = Phase 2 decision. | Nothing now |
| OQ4 | Minor-consent flow by region; school-as-provider model | 13+ self-attestation at signup; parental-consent slot reserved in onboarding; **legal review before school distribution**. | School tier only |
| OQ5 | Community host (Skool vs in-app) | Out of scaffold scope (Phase 2); route stub only. | Nothing |
| OQ6 | Free-tier "generous limit" + paid price | Beta default: 1 full check-in/day + unlimited Mini Resets free; limits config-driven, not hardcoded; price left as Stripe env until Cat sets it. | M2 billing copy |
| OQ7 | Rate-limit backing store | Postgres fixed-window (no new vendor); interface swappable to Upstash if scale demands. | Nothing |
| OQ8 | Supabase branching vs two projects | Two projects (staging/prod) now; revisit branching when team grows. | Nothing |

**Risks:** R1 — content gaps (Section 6) are the likeliest schedule risk for M2; mitigation: review packet to Cat at M1 exit, authored-subset shipping rule. R2 — Red safety reviewer not yet identified; mitigation: gate is structural, not scheduled. R3 — LLM cost at freemium scale unknown; mitigation: verbatim mode + token budgets + per-user limits from day one. R4 — solo-founder review bandwidth; mitigation: small PRs, preview links per PR so Cat reviews by clicking, not reading diffs.

---

## 8. Milestone 0 — proposed first PR breakdown

Small, reviewable, each leaves `main` deployable; every PR gets a preview URL.

| PR | Contents | Proves |
|---|---|---|
| **PR1 — repo scaffold** | create-next-app (App Router, TS strict), Tailwind, pnpm, ESLint/Prettier, Vitest + one real test, folder skeleton per CLAUDE.md, `.env.example`, README | Repo builds and tests locally |
| **PR2 — CI + branch protection** | GitHub Actions (typecheck/lint/test/build/audit), Vercel project wired, preview deploys on | The PR itself gets a preview URL and green checks; `main` protected |
| **PR3 — docs normalization** (`content:`) | Source `.txt` → `docs/paths/`, `docs/tools/`, `docs/onboarding/` verbatim; `claude.md`→`CLAUDE.md`; conflict notes (Section 0) filed as issues | Canonical sources live where CLAUDE.md says; zero text changes (diff = renames) |
| **PR4 — design tokens + UI primitives** | Patagonia palette as Tailwind tokens/CSS vars, type scale, Button/Card/TipBox in `components/ui/`, token-only lint rule (no raw hex in components) | Design system foundations; AA contrast pairings documented |
| **PR5 — Supabase + auth** | Supabase clients (SSR helpers), migration 0001 `profiles` + RLS, email/password + Google OAuth, auth routes, middleware-protected `(app)` group, settings stub | Sign up → onboard (role + display name) → protected dashboard, on preview |
| **PR6 — landing page v0** | `(marketing)` landing: hero (static, `NEEDS-CAT` slots marked), problem/solution/how-it-works/pricing-promise sections, mobile-first 375px, voice-linted copy | The production first impression; when-in-doubt tests pass |
| **PR7 — security baseline** | Security headers, rate-limit util + tests, bundle secret-leak check in CI, `docs/security.md` (checklist from Section 5 as living doc) | Security posture is in CI, not in memory |

Merge order: 1→2→3 in sequence; 4–7 parallelizable after 2. M0 exit = all seven merged, production URL shared.

---

## 9. Verification (how each milestone is proven)

- **M0:** CI red/green demo (introduce a type error on a branch → blocked); auth round-trip on production; Lighthouse mobile pass on landing; grep proves no raw hex in components.
- **M1:** full Green check-in on production in verbatim mode; `pnpm test` covers every authored transition/fallback (coverage report on `lib/guidepost/`); RLS policy tests (cross-user read fails); content snapshot test fails if an authored string is edited without a `content:` commit.
- **M2:** Playwright E2E — Green and Yellow check-ins end-to-end on preview, incl. evening variant (clock-mocked) and each 2A–2E branch; safety red-team prompt set triggers pause + resources and writes only non-identifiable telemetry; Stripe test-mode subscribe→entitle→cancel-in-two-taps; tone eval v0 blocking in CI.
- **M3:** flags-off production diff is user-invisible; flags-on preview walkthrough of Blue (all Stage 3/6 shifts) and Red (3A/3B, regulated shift) recorded for Cat; CI assertion proves Red unreachable in production build without both gates.

---

*Review checklist for this plan (CLAUDE.md's tests): safe to a stressed 14-year-old — safety layer precedes LLM, gentle limits, no dark patterns · sounds like Juniper — all user-facing copy is Cat's or flagged `NEEDS-CAT` · in Cat's authored content — verbatim with CI enforcement · simplest version that works — verbatim mode, env flags, Postgres rate limiting, no extra vendors.*
