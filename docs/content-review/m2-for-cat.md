# M2 — for Cat's review

_What shipped in Milestone 2, and every place we wrote a draft or left a gap
waiting on your words. Nothing here is locked; strike or rewrite anything._

Juniper's tone-adaptation is now live (Anthropic Claude API, per your call),
but it only ever **rephrases your authored lines** toward the calibrated tone —
it never writes new dialogue, and with no key it falls back to your exact
words. The safety layer, tools, dashboard, billing, and an interactive landing
hero all landed. Details below.

## Decisions we built to (your answers, 2026-07-08)

- **AI provider:** Anthropic Claude API, small/fast model, your words as the
  guaranteed fallback. The source-material knowledge base you described is
  **designed, not built** — see `docs/plans/source-material-kb.md`; it's gated
  on your sign-off before any build.
- **Pricing (D2):** free = 1 full check-in/day + unlimited Mini Resets; paid =
  unlimited. **Price is still blank** — it lives in config, no number is baked
  into code. Tell us the number when you're ready.
- **Reflective-depth cap (D4):** after **3** heavy free-text turns in a row,
  Juniper offers a grounding reset instead of another probing question. See the
  gap below — we still need you to (a) confirm which nodes count as "probing"
  and (b) write the gentle transition line.

## Draft lines we wrote — need your ear

| Where | Draft | Note |
|---|---|---|
| Crisis intro | "Before we go any further — what you just shared sounds heavy, and it matters more than any plan we could make today." | steady, no alarm |
| Crisis trusted-adult | "Is there an adult you trust — a parent, a teacher, a counselor — you could talk to today? You don't have to carry this alone." | your recorded answer was partly an unclear transcription — please re-record |
| Paywall (free limit hit) | "You've used today's check-in. Come back tomorrow whenever you're ready — or unlock unlimited check-ins any time. Mini Resets are always free." | kind, no dark pattern |
| Resume offer | "You have a check-in you didn't finish. Want to pick up where you left off?" | |
| Streak (habit) | "3-day streak" / "fresh start" | no shame on reset |

The boundary line ("I'm not a counselor, but here's someone who can help.") and
both hotlines (988; text HOME to 741741) are **locked exactly as written** and
regression-tested.

## Gaps — we built the structure, you write the words

- **G-S1 — Trusted-adult "equip, don't just name" (your D3 direction).** We
  built the slot for scripts / tools / guidance to help a student actually
  approach a trusted adult, but wrote no scripts. Needs a heading + a few
  conversation starters. Hidden until you fill it.
- **Reflective-depth transition (D4).** The gentle, non-dismissive line Juniper
  says when it pulls back to a reset after 3 heavy turns — and your call on
  which nodes count. The cap mechanism is built and tested; it's inert until
  these land.
- **G-T1 — Start Small Planner & Gentle Focus Anchor interior copy.** Both work
  as structured tools; their guidance/cue copy is empty.
- **G-T2 — Micro-Needs Menu.** Seeds are your authored "stretch / silence /
  reassurance"; the per-item responses (what Juniper says when a need is
  picked) are missing.
- **G-T3 — Evening Wind Down.** The three options (preview next day / habit
  stack / pause with intention) are yours; the prompt set behind each is empty.
- **G-B2 — Mood-Matching Visual.** The color wheel / metaphor deck items — the
  picker only appears once you supply them; nothing is invented.
- **G-L1 — Landing hero script.** The interactive hero uses your existing
  router question + the authored path beats, verbatim. If you want a bespoke
  hero exchange, that's the slot.

## Two questions about `index.html` (your static mockup)

1. It loads external fonts (Fontshare/Google). That conflicts with our
   self-only content-security policy and the no-third-party rule. Self-host
   equivalents, or drop them?
2. Once the Next landing fully matches your mockup's feel, should we remove
   `index.html` from the repo root? (It isn't served by the app.)

## Still open (not blocking M2)

- Exact **price** (D2).
- **Red Path** reviewer + timing (D5) — still gated; cannot ship without a
  signed safety review.
- **Van Edwards / Big Five** communication-style → tone rubric (D9) and the
  "source material API" — needed before quiz scoring turns on.
- Community **paid-vs-free** + who moderates (D10/D11) — M4.
