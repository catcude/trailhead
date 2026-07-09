# Red Path — Safety Review & Release Gate

> **Status: NOT APPROVED. The Red Path is feature-flagged off and cannot ship
> until this review is completed and signed.** `RED_PATH_RELEASE_APPROVED` may
> be set to `true` **only** after a named reviewer signs section 7 below.

## 0. Why this gate exists

CLAUDE.md: *"The Red Path cannot ship without a dedicated safety review."* Red
serves users who are **dysregulated / overwhelmed** and need a nervous-system
reset. Per Cat (D5, 2026-07-08), being on Red does **not** by itself mean
imminent danger — but Red is where emotionally-flooded users land, so its
release is gated on a review that this document structures.

The gate is enforced structurally, not by convention:

- `lib/flags.ts` — `redPath` is `true` only when **both** `FF_RED_PATH` and
  `RED_PATH_RELEASE_APPROVED` are `"true"` (double gate).
- `lib/guidepost/router.ts` — `isPathAllowed("red", flags)` follows that gate;
  `assertPathServable` throws in production if Red content is ever resolved
  without it (fail-closed backstop).
- `app/api/checkin/route.ts` — refuses Red at router entry, refuses a
  cross-path **shift** into Red, and refuses to **resume** a Red session, all
  via the same gate.
- `tests/guidepost/red-gate.test.ts` — blocking CI regression guard: asserts
  Red is unreachable via router AND shift with flags off, and reachable only
  when both envs are set.

**Never** set `FF_RED_PATH` or `RED_PATH_RELEASE_APPROVED` in any committed env
file, CI config, or Vercel environment. Preview testing uses per-branch,
human-performed env flips only.

## 1. Reviewer & scope

- Reviewer (name / role): _______________________  (TBD — human task, still open)
- Review date: _______________________
- Build reviewed (commit SHA): _______________________
- Scope: the full Red flow (`content/paths/red.ts`), its Mini Reset Toolkit,
  the crisis-lexicon interplay, and the escalation-threshold definition (§4).

## 2. Crisis-handling transcripts (red-team)

Attach transcripts of these runs (preview, flags on). Each must show the
deterministic safety screen firing **before** anything else on free text.

- [ ] Crisis phrase entered at Red Stage 3A (free-text priorities) → flow
      pauses, authored 988 / Crisis Text Line / boundary shown, session closed,
      `safety_events` row = category/path/stage only (no text/user/session id).
- [ ] Crisis phrase at Stage 5 (reality check, free text) → same.
- [ ] Crisis phrase in the Stage-5 "add what's missing" free text → same.
- [ ] Mid-Red lexicon hit does NOT get rephrased by the LLM and is never
      routed through the adapt layer.
- [ ] Leetspeak / obfuscated variants still trip the lexicon (conservative).

## 3. Grounding-exit coverage

- [ ] Every Red choice/free-text node offers `stillStuck` + `nothingSoundsRight`
      fallbacks (grounding exits everywhere — PRD §6.3). Spot-checked against
      `content/paths/red.ts`.
- [ ] The Mini Reset (3B) never dead-ends; re-entry returns to planning.
- [ ] "Overwhelmed again" at Stage 5 routes to protective coaching (reset), not
      planning pressure.

## 4. Escalation threshold (D5) — the core question

Red-Path usage is normal day-to-day dysregulation; the line to "needs a
professional" is defined by **intensity, frequency, and duration** over time.

- [ ] Define the concrete threshold (e.g. N Red sessions in M days, or
      sustained daily Red for W weeks) — **gap G-R5**.
- [ ] Confirm the signal is computed ONLY from the user's **own** owner-only
      `chat_sessions` history and surfaced **only to them** — never to
      parents/teachers, never added to the identifier-free `safety_events` log.
- [ ] Confirm the surfaced message is supportive, non-clinical, and offers
      human resources — never a diagnosis.

## 5. Content approvals (Cat)

- [ ] All Red Juniper lines are verbatim from `docs/paths/red-path.md`.
- [ ] `needsCat` drafts resolved: Stage-1 caring-action line; Stage-5
      processing-changes explanation (G-R3); Mini Reset re-entry line.
- [ ] Gaps resolved or explicitly deferred: G-R1 (Stage-2 quick-taps), G-R2
      (ask-for-help scripts / deadline-reality check).

## 6. Legal / privacy

- [ ] Minors' data posture (COPPA/FERPA) reviewed for Red specifically.
- [ ] No identifiable safety telemetry; no dialogue-content logging; no Red
      signal shared outside the user.

## 7. Sign-off

By signing, the reviewer confirms every box above is checked and the escalation
threshold (§4) is defined and privacy-preserving.

- Reviewer signature: _______________________  Date: ____________
- Only after this signature may an operator set `RED_PATH_RELEASE_APPROVED=true`
  (with `FF_RED_PATH=true`) in a production environment.
