/**
 * In-dialogue tool content (WS5). Only Cat's authored strings live here,
 * verbatim from docs/tools/reusable-tools.md + the path docs. Interior copy
 * that Cat hasn't written yet is a GAP: the arrays stay empty and the tool
 * renders only its authored subset, hiding empty sections (never generated).
 *
 * The one-liner `description`s are the authored tool descriptions from
 * reusable-tools.md. Where a tool needs richer interior content (per-item
 * responses, grounding cues, mood items, evening prompts), that is flagged
 * with a gapRef and surfaced in docs/content-review/m2-for-cat.md.
 */

export interface DialogueToolContent {
  description: string;
  sourceRef: string;
  /** Authored option/item seeds, when the docs provide them. */
  items?: { id: string; label: string }[];
  /** Gap marker for interior copy Cat still owes. */
  gapRef?: string;
  needsCat?: boolean;
}

const SRC = "docs/tools/reusable-tools.md";

export const dialogueTools = {
  startSmallPlanner: {
    description: "helps users break big tasks into light, actionable steps",
    sourceRef: SRC,
    gapRef: "G-T1", // interior prompts/microcopy pending Cat
    needsCat: true,
  },
  microNeedsMenu: {
    description:
      "offers subtle support prompts based on physical or emotional needs",
    sourceRef: SRC,
    // Authored seeds from the doc parenthetical "(e.g., stretch, silence,
    // reassurance)". Per-item Juniper responses are a gap (G-T2), hidden.
    items: [
      { id: "stretch", label: "stretch" },
      { id: "silence", label: "silence" },
      { id: "reassurance", label: "reassurance" },
    ],
    gapRef: "G-T2",
    needsCat: true,
  },
  gentleFocusAnchor: {
    description:
      "helps refocus attention with sensory grounding or movement cues",
    sourceRef: SRC,
    gapRef: "G-T1", // the actual grounding/movement cues pending Cat
    needsCat: true,
  },
  moodMatchingVisual: {
    description:
      "color wheel or metaphor deck to help users name their current state",
    sourceRef: SRC,
    // The actual mood items (color wheel / metaphor deck) are a gap (G-B2).
    items: [] as { id: string; label: string }[],
    gapRef: "G-B2",
    needsCat: true,
  },
  eveningWindDown: {
    description:
      "end-of-day reflection with options to preview next day, habit stack, or pause with intention",
    sourceRef: SRC,
    // The three options are authored in the description; the prompt set behind
    // each is a gap (G-T3), hidden until Cat writes it.
    items: [
      { id: "preview-next-day", label: "Preview next day" },
      { id: "habit-stack", label: "Habit stack" },
      { id: "pause-with-intention", label: "Pause with intention" },
    ],
    gapRef: "G-T3",
    needsCat: true,
  },
  ahaTracker: {
    description:
      "lets users tag insights or clarity moments that shift motivation",
    sourceRef: SRC,
    // Built fully — free text + optional tag; no interior gap.
  },
} satisfies Record<string, DialogueToolContent>;

export type DialogueToolId = keyof typeof dialogueTools;
