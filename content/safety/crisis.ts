/**
 * Crisis-response content ("depth of water" pause). NEVER adaptable — the
 * LLM does not touch this. The boundary line is authored (CLAUDE.md §Safety
 * & Escalation); the intro and trusted-adult prompt are team drafts in
 * Juniper's steady register awaiting Cat's voice pass (flagged in
 * docs/content-review/). Resource details are factual.
 */
export interface CrisisResource {
  name: string;
  detail: string;
}

export const crisisContent = {
  /** Draft (needsCat): steady, no alarm, no judgment. */
  intro:
    "Before we go any further — what you just shared sounds heavy, and it matters more than any plan we could make today.",
  introNeedsCat: true,
  /** Authored boundary line — verbatim from CLAUDE.md/PRD. */
  boundary: "I’m not a counselor, but here’s someone who can help.",
  boundarySourceRef: "CLAUDE.md §Safety & Escalation",
  resources: [
    {
      name: "988 Suicide & Crisis Lifeline",
      detail: "Call or text 988 — free, 24/7 (US)",
    },
    {
      name: "Crisis Text Line",
      detail: "Text HOME to 741741 — free, 24/7 (US)",
    },
  ] satisfies CrisisResource[],
  /** Draft (needsCat). */
  trustedAdult:
    "Is there an adult you trust — a parent, a teacher, a counselor — you could talk to today? You don’t have to carry this alone.",
  trustedAdultNeedsCat: true,
  /**
   * D3 — "equip, don't just name." Cat's direction is that Juniper should give
   * the student actual scripts, tools, and guidance for approaching a trusted
   * adult, not merely suggest one. This is the STRUCTURE only: a heading slot
   * and a list of conversation starters, all `adaptable: false`.
   *
   * The copy is a GAP (G-S1, needsCat): Cat's recorded answer was a partial
   * voice transcription, so nothing is written here. While empty, the slot is
   * hidden — composeSafetyMessages() and the content lock skip it until Cat
   * provides the heading and starters (docs/content-review/m2-for-cat.md).
   */
  startConversation: {
    heading: undefined as string | undefined,
    starters: [] as string[],
    needsCat: true,
    gapRef: "G-S1",
  },
} as const;
