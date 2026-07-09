import { RETURN_TARGET, type PathContent } from "../schema";

/**
 * Blue Path — From Disconnection to Awareness (the "I'm fine" path).
 * All Juniper text VERBATIM from docs/paths/blue-path.md (Cat's IP). Flag-gated
 * in the router (NEXT_PUBLIC_FF_BLUE_PATH); production is unchanged until Cat
 * approves the content and the flag flips.
 *
 * Known gaps (hidden or annotated, never fabricated; see m3-for-cat.md):
 *  - G-B1: per-metaphor Stage-2 responses aren't authored → all five route to
 *    the shared Stage-3 beat.
 *  - G-B2: the Mood-Matching Visual's own items (color wheel / metaphor deck)
 *    are a gap; the five authored metaphors ARE the Stage-2 selection.
 *  - G-B3: the Stage-6 grounding breath script isn't authored → s6-grounding
 *    is a hidden slot that passes through to reflection (never dead-ends).
 *  - G-B4: while Red is gated, Stage-3 "heart's loud" routes to an authored-
 *    material interim (never a dead-end). One needsCat bridge line. When Red
 *    unflags, retarget the s3 "heart-loud" option to "red:s1".
 */
export const blue: PathContent = {
  path: "blue",
  contentVersion: "2026-07-09.1",
  entryNodeId: "s1",
  nodes: {
    // ── Stage 1 — The Surface Scan ──────────────────────────────────────────
    s1: {
      id: "s1",
      kind: "choice",
      stage: 1,
      tone: "curious",
      juniper: {
        text: "Sounds like you’re in that ‘neutral zone’—not bad, not amazing. Want to stay there, or explore a little?",
        adaptable: true,
        sourceRef: "paths/blue-path.md §Stage 1",
      },
      options: [
        {
          id: "stay-here",
          label: "I’m good staying right here.",
          target: "s1-stay",
        },
        {
          id: "deeper",
          label: "Maybe I do want to check in a little deeper.",
          target: "s1-deeper",
        },
        {
          id: "maybe-not",
          label: "I mean... I’m saying I’m fine, but maybe I’m not?",
          target: "s1-maybe-not",
        },
      ],
      fallbacks: {
        idk: "fallback-flip",
        nothingSoundsRight: "mini-reset",
        stillStuck: "fallback-still-stuck",
      },
    },
    "s1-stay": {
      id: "s1-stay",
      kind: "message",
      stage: 1,
      tone: "curious",
      juniper: {
        text: "Totally cool. Some days are just about cruising. We don’t have to dig if nothing’s calling. But if something starts to poke at you later, just say the word.",
        adaptable: true,
        sourceRef: "paths/blue-path.md §Stage 1 (Option 1)",
      },
      next: "s6",
    },
    "s1-deeper": {
      id: "s1-deeper",
      kind: "message",
      stage: 1,
      tone: "curious",
      juniper: {
        text: "No rush—we’ll just ease in. Not trying to stir anything up, just checking if anything underneath the ‘fine’ wants a second of air.",
        adaptable: true,
        sourceRef: "paths/blue-path.md §Stage 1 (Option 2)",
      },
      next: "s2",
    },
    "s1-maybe-not": {
      id: "s1-maybe-not",
      kind: "message",
      stage: 1,
      tone: "curious",
      juniper: {
        text: "Yeah, that makes total sense. ‘Fine’ can be code for a lot of things—like ‘I’m holding it together but barely.’ Want to put a name to what’s really there?",
        adaptable: true,
        sourceRef: "paths/blue-path.md §Stage 1 (Option 3)",
      },
      next: "s2",
    },

    // ── Stage 2 — Subtle Signals Check ──────────────────────────────────────
    // G-B1: per-metaphor tailored responses aren't authored, so all five
    // options route to the shared Stage-3 beat. G-B2: the Mood-Matching Visual
    // deck is a hidden gap; these five authored metaphors are the selection.
    s2: {
      id: "s2",
      kind: "choice",
      stage: 2,
      tone: "calm",
      juniper: {
        text: "Okay, vibe check time. If you had to pick one, which one feels most like you right now?",
        adaptable: true,
        sourceRef: "paths/blue-path.md §Stage 2",
      },
      options: [
        { id: "numb", label: "☁️ Numb", target: "s3" },
        { id: "autopilot", label: "🔁 On autopilot", target: "s3" },
        { id: "boxed-in", label: "📦 Boxed in", target: "s3" },
        { id: "faking", label: "🎭 Faking it", target: "s3" },
        {
          id: "managing",
          label: "📏 Just managing things as they come",
          target: "s3",
        },
      ],
    },

    // ── Stage 3 — The Mismatch Moment ───────────────────────────────────────
    s3: {
      id: "s3",
      kind: "choice",
      stage: 3,
      tone: "grounding",
      juniper: {
        text: "Sometimes ‘fine’ just means… I haven’t really checked in yet. Want to do that together real quick?\n\nTry this: Close your eyes—just for a breath or two. Then check in with your head, your heart, and your body. Which one’s being the loudest today?",
        adaptable: true,
        sourceRef: "paths/blue-path.md §Stage 3",
      },
      options: [
        {
          id: "head-full",
          label: "🧠 My head is full—I can’t stop thinking",
          target: "yellow:s1",
        },
        {
          // Red is gated → route to an authored-material interim (G-B4). When
          // Red unflags, change this target to "red:s1".
          id: "heart-loud",
          label: "💓 My heart’s loud—I’m feeling more than I thought",
          target: "s3-heart-interim",
        },
        {
          id: "body-tired",
          label: "🛌 My body’s tired—it’s all catching up",
          target: "s4",
        },
        {
          id: "dont-know",
          label: "🤷 I honestly don’t know",
          target: "s4",
        },
      ],
    },
    // Blue heart-loud interim (G-B4): one needsCat bridge line, then into the
    // Quiet Needspotting beat so an emotionally-loaded user is never dead-ended.
    "s3-heart-interim": {
      id: "s3-heart-interim",
      kind: "message",
      stage: 3,
      tone: "grounding",
      juniper: {
        text: "That sounds like a lot to be holding. Let’s slow down and take care of you first.",
        adaptable: false,
        sourceRef:
          "paths/blue-path.md §Stage 3 (heart-loud interim — gap G-B4)",
        needsCat: true,
      },
      next: "s4",
    },

    // ── Stage 4 — Quiet Needspotting ────────────────────────────────────────
    s4: {
      id: "s4",
      kind: "tool",
      stage: 4,
      tone: "grounded",
      juniper: {
        text: "Is there anything small you need today—but haven’t said out loud yet?\n\nLike… a deep breath, a snack, a little reassurance, a break from people?",
        adaptable: true,
        sourceRef: "paths/blue-path.md §Stage 4",
      },
      tool: { type: "microNeedsMenu" },
      next: "s5",
    },

    // ── Stage 5 — Reorientation ─────────────────────────────────────────────
    s5: {
      id: "s5",
      kind: "choice",
      stage: 5,
      tone: "encouraging",
      juniper: {
        text: "What’s one small thing you could do today to feel a little more like *you*?",
        adaptable: true,
        sourceRef: "paths/blue-path.md §Stage 5",
      },
      options: [
        {
          id: "stretch-water-walk",
          label: "Stretch, drink water, short walk",
          target: "s5-focus",
        },
        {
          id: "small-task",
          label: "Do one small thing I’ve been avoiding",
          target: "s5-plan",
        },
        { id: "rest", label: "Rest or stillness", target: "s6" },
        { id: "idk", label: "I don’t know what I need", target: "s5-idk" },
      ],
    },
    // Tool summons carry no invented Juniper line; each tool renders its own
    // authored copy, then the flow returns to closure.
    "s5-focus": {
      id: "s5-focus",
      kind: "tool",
      stage: 5,
      tone: "encouraging",
      tool: { type: "gentleFocusAnchor" },
      next: "s6",
    },
    "s5-plan": {
      id: "s5-plan",
      kind: "tool",
      stage: 5,
      tone: "encouraging",
      tool: { type: "startSmallPlanner" },
      next: "s6",
    },
    // "I don't know" → the doc has Juniper suggest a micro-action (water, step
    // outside, tidy one item); the Micro-Needs Menu surfaces exactly those, so
    // no line is invented here.
    "s5-idk": {
      id: "s5-idk",
      kind: "tool",
      stage: 5,
      tone: "encouraging",
      tool: { type: "microNeedsMenu" },
      next: "s6",
    },

    // ── Stage 6 — Gentle Closure or Re-entry ────────────────────────────────
    s6: {
      id: "s6",
      kind: "choice",
      stage: 6,
      tone: "reflective",
      juniper: {
        text: "Whatever just happened here—even if it felt small—it matters. You didn’t blow past your feelings. You paused. That’s not nothing.",
        adaptable: true,
        sourceRef: "paths/blue-path.md §Stage 6",
      },
      options: [
        {
          id: "good-here",
          label: "I think I’m good right here.",
          target: "s6-reflect",
        },
        {
          id: "explore-yellow",
          label:
            "I want to keep exploring ways to move forward today—without stressing myself out.",
          target: "yellow:s1",
        },
        {
          id: "ready-green",
          label:
            "I feel ready to tackle the day—but I’m not sure where to start.",
          target: "green:welcome",
        },
        {
          id: "grounding",
          label: "Can we end with something grounding?",
          target: "s6-grounding",
        },
      ],
    },
    // G-B3: the grounding breath + affirmation script isn't authored. Hidden
    // slot — passes through to reflection so the beat never dead-ends. When Cat
    // writes the script, this node carries it (before s6-reflect).
    "s6-grounding": {
      id: "s6-grounding",
      kind: "message",
      stage: 6,
      tone: "reflective",
      tip: {
        sourceRef: "paths/blue-path.md §Stage 6 (Option 4 — grounding script)",
        gapRef: "G-B3",
      },
      next: "s6-reflect",
    },
    "s6-reflect": {
      id: "s6-reflect",
      kind: "reflection",
      stage: 6,
      tone: "reflective",
      juniper: {
        // G-B4-adjacent: outcome→tag mapping unspecified; user picks from the
        // authored Blue reflection bank. Prompt line is a team draft.
        text: "Which of these feels true to carry with you?",
        adaptable: true,
        sourceRef: "paths/blue-path.md §Reflection Tags (matching reflection)",
        needsCat: true,
      },
      quoteBank: "blue",
      next: "end",
    },
    end: {
      id: "end",
      kind: "end",
      stage: 6,
      tone: "reflective",
    },

    // ── Fallback nodes (universal, mirrors Yellow) ──────────────────────────
    "fallback-flip": {
      id: "fallback-flip",
      kind: "freeText",
      stage: 1,
      tone: "grounding",
      juniper: {
        text: "What do you *not* want to feel today?",
        adaptable: true,
        sourceRef: "paths/green-path.md §Cheat Sheet 6 (universal fallback)",
      },
      next: RETURN_TARGET,
    },
    "fallback-still-stuck": {
      id: "fallback-still-stuck",
      kind: "choice",
      stage: 1,
      tone: "grounding",
      juniper: {
        text: "Want to look back at your Weekly Horizon, or take a quick walk or stretch and come back?",
        adaptable: true,
        sourceRef: "paths/green-path.md §Cheat Sheet 6 (universal fallback)",
        needsCat: true,
      },
      options: [
        {
          id: "weekly-horizon",
          label: "Show me my Weekly Horizon",
          target: RETURN_TARGET,
          needsCat: true,
        },
        {
          id: "walk-stretch",
          label: "Walk or stretch, then retry",
          target: RETURN_TARGET,
          needsCat: true,
        },
      ],
    },
    "mini-reset": {
      id: "mini-reset",
      kind: "tool",
      stage: 1,
      tone: "grounding",
      juniper: {
        text: "Still feeling scattered or stuck?",
        adaptable: false,
        sourceRef: "paths/green-path.md §Mini Reset Toolkit (trigger prompts)",
      },
      tool: { type: "miniResetToolkit", props: { toolkit: "green" } },
      next: RETURN_TARGET,
    },
  },
};
