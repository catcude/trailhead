# Source-Material Knowledge Base — design (DESIGN-ONLY, gated)

_Status: **design only.** Nothing here is built. This document exists so the
idea can be reviewed and refined before any build milestone picks it up. Do not
ship retrieval on the strength of this doc — it must be signed off first (see
Gate)._

## Where this came from (D1)

Cat's direction (2026-07-08): start with the dialogue tree + her verbatim
words, then **build a Supabase-backed knowledge base from her source material
that the AI draws on to answer and guide the user** — because "the dialogue
tree as it is, is not complex enough to meet what people's needs are going to
be." The provider is Anthropic's Claude API (chosen 2026-07-08); the "API for
the source material" she mentioned is still unspecified.

This is a genuine architectural evolution beyond M2's rule ("the LLM only
rephrases authored text"). It must not erode the guarantees that make Guidepost
safe and make it Cat's IP rather than a chatbot.

## Non-negotiables this design must preserve

1. **Safety first, always.** The deterministic crisis lexicon (`lib/llm/safety`)
   runs on free text **before any retrieval or model call**, exactly as today.
   Retrieval never sees text that hasn't passed the screen, and a crisis pause
   is never overridden by a retrieved answer.
2. **The state machine still owns flow.** Retrieval may inform *phrasing and the
   content of an answer within the current node*; it may **never** select the
   next node, stage, path, option, or tool. `lib/guidepost/machine.ts` remains
   the only thing that moves the user (PRD §6.2). If a feature seems to need the
   model to choose the path, the design is wrong.
3. **No fabricated dialogue or reflection quotes.** Authored Juniper lines and
   quote banks stay verbatim and lock-protected (`content/authored.lock.json`).
   The KB augments *free-text answering within a node*; it does not rewrite
   authored beats or invent new quotes.
4. **Grounded only in Cat-approved source material.** Every retrievable chunk
   traces to a Cat-approved document, with provenance stored alongside it. The
   model answers *from* that material, cites/attributes internally, and says "I
   don't have that" rather than inventing when the KB is thin.
5. **Privacy unchanged.** No profile/email/display-name in prompts; no
   dialogue-content logging; identifier-free safety telemetry only. Retrieval
   queries are session-scoped and not retained as behavioral analytics.
6. **Verbatim fallback remains permanent.** With the KB or provider unavailable,
   the product degrades to the authored dialogue tree with no user-facing error
   — the same floor `verbatim` provides today.

## Sketch (to be challenged in review, not implemented)

- **Store:** a Supabase table of source-material chunks (text + embedding +
  provenance: document, section, approval date). Supabase `pgvector` for
  similarity search. Ingestion is an offline, reviewed step — only
  Cat-approved documents enter; each chunk carries its source.
- **Retrieval seam:** a new module under `lib/llm/` (e.g. `lib/llm/kb.ts`) that,
  **only inside an already-selected node that permits KB-grounded answering**,
  fetches the top-k relevant approved chunks for the user's free text and passes
  them to the model as grounding context with a hard "answer only from these;
  if they don't cover it, say so" constraint.
- **Prompt discipline:** extends the Juniper persona/constraint block — still no
  new questions/advice beyond the node's intent, still tone-calibrated, still
  under a length budget, still 14-year-old readable.
- **Where it plugs in:** a node opts in (a schema flag, like `emotionalProbe`),
  so KB-grounded answering is scoped to specific authored beats — never global.
- **Safety ordering (unchanged):** free text → crisis screen → (if node opts in
  and provider active) retrieve approved chunks → grounded answer; on any
  failure, fall back to the authored beat.

## Open questions to resolve BEFORE building

- Provider is Claude; what is the "API for the source material" Cat referenced —
  a specific corpus, a licensed dataset, or her own documents only?
- Which documents are in-scope, and what's the approval/versioning workflow so
  the KB can never drift from Cat-approved material?
- How is provenance surfaced (internally for review; to the user at all)?
- Cost/latency budget at freemium scale (retrieval + larger prompts).
- How KB answers interact with the tone eval (WS3) — the judge/voice-lint must
  cover KB-grounded output too.
- Does any of this touch minors' data handling (COPPA/FERPA posture)?

## Gate

This design must be reviewed and signed off by **Cat** and a **safety/privacy
review** before any build milestone starts. The review must confirm every
non-negotiable above is preserved by the concrete design. Until then, Guidepost
ships on the dialogue tree + verbatim words + tone-rephrasing only.
