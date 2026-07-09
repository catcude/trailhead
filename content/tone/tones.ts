/**
 * Juniper tone registry — descriptors transcribed from the path cheat sheets.
 * Data-only in M1; the M2 LLM prompt layer consumes these to calibrate
 * phrasing. Tone is a functional requirement, not a style preference.
 */
export const tones: Record<string, { descriptor: string; sourceRef: string }> =
  {
    focused: {
      descriptor: "Focused, Encouraging, Empowering",
      sourceRef: "paths/green-path.md §Cheat Sheet 2 (core emotional energy)",
    },
    encouraging: {
      descriptor: "Encouraging, adaptive to emotion, emotionally safe",
      sourceRef: "paths/yellow-path.md §Cheat Sheet Stage 5",
    },
    hyped: {
      descriptor: "Playful, hyped, encouraging",
      sourceRef: "paths/green-path.md §Cheat Sheet 4 (Ready to crush it)",
    },
    reassuring: {
      descriptor: "Reassuring, steady, normalize nerves",
      sourceRef: "paths/green-path.md §Cheat Sheet 4 (Ready but nervous)",
    },
    calming: {
      descriptor: "Calming, simplified",
      sourceRef:
        "paths/green-path.md §Cheat Sheet 4 (Optimistic but overwhelmed)",
    },
    reflective: {
      descriptor: "Reflective, validating, informative",
      sourceRef: "paths/green-path.md §Cheat Sheet 4 (Processing plan changes)",
    },
    grounding: {
      descriptor: "Grounding, patient, small-win oriented",
      sourceRef: "paths/green-path.md §Cheat Sheet 4 (Not sure)",
    },
    steady: {
      descriptor:
        "Tone flows from stabilizing → normalizing → gently motivating",
      sourceRef: "paths/yellow-path.md §Cheat Sheet Stage 2",
    },
    practical: {
      descriptor: "Practical, flexible, non-judgmental",
      sourceRef: "paths/yellow-path.md §Cheat Sheet Stage 3",
    },
    affirming: {
      descriptor: "Respectful of user’s reality; honors effort to adapt",
      sourceRef: "paths/yellow-path.md §Cheat Sheet Stage 4",
    },
    warm: {
      descriptor: "Reflective, warm, and affirming regardless of outcome",
      sourceRef: "paths/yellow-path.md §Cheat Sheet Stage 6",
    },
    curious: {
      descriptor: "Reassuring, curious, and grounding",
      sourceRef: "paths/yellow-path.md §Cheat Sheet Stage 1",
    },
  };

/**
 * Stage-5 tone recalibration (PRD §3.3). The student's check-in selection at
 * Stage 5 recalibrates Juniper's tone for the rest of the session. Keyed by
 * the Stage-5 option id (shared across Green `s5-checkin` and Yellow `s5`),
 * mapped by the PRD emoji rows:
 *   💪 → hyped · 😬 → reassuring · 🌀 → calming · 🔄 → reflective · 🤷 → grounding
 * These are transcriptions of the PRD table, not user-facing copy.
 */
export const stage5ToneByChoice: Record<string, string> = {
  "crush-it": "hyped", // 💪 Ready to crush it
  nervous: "reassuring", // 😬 Ready but nervous
  overwhelmed: "calming", // 🌀 Optimistic but overwhelmed (Green)
  foggy: "calming", // 🌀 Foggy or unsure (Yellow)
  processing: "reflective", // 🔄 Processing plan changes (Green)
  adjusting: "reflective", // 🔄 Still adjusting to changes (Yellow)
  "not-sure": "grounding", // 🤷 Not sure (Green)
  idk: "grounding", // 🤷 I don't know yet (Yellow)
};

/**
 * The recalibrated tone for this session, if the student has made a Stage-5
 * selection. `choices` is keyed by node id — Green records under `s5-checkin`,
 * Yellow under `s5`. Returns undefined when no Stage-5 choice is recorded yet
 * (the caller then falls back to the current node's own tone).
 */
export function recalibratedTone(
  choices: Record<string, string>,
): string | undefined {
  const choice = choices["s5-checkin"] ?? choices["s5"];
  return choice ? stage5ToneByChoice[choice] : undefined;
}
