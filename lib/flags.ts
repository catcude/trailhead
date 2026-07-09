/**
 * Feature flags (scaffolding plan §4.5) — env-driven, no vendor.
 * Checked in the path router and content loader, not sprinkled through
 * components.
 *
 * Red Path double gate: FF_RED_PATH alone is NOT enough — the release also
 * requires RED_PATH_RELEASE_APPROVED, which may only be set after the
 * dedicated safety review (docs/safety/red-path-review.md) is signed off.
 */
export interface Flags {
  bluePath: boolean;
  redPath: boolean;
  dashboardExtras: boolean;
  quizScoring: boolean;
  /**
   * Second-pass LLM crisis classifier (WS4). Add-only augmentation of the
   * deterministic lexicon; default off until reviewed. Never weakens the
   * lexicon floor.
   */
  safetyClassifier: boolean;
}

export function getFlags(): Flags {
  return {
    bluePath: process.env.NEXT_PUBLIC_FF_BLUE_PATH === "true",
    redPath:
      process.env.FF_RED_PATH === "true" &&
      process.env.RED_PATH_RELEASE_APPROVED === "true",
    dashboardExtras: process.env.FF_DASHBOARD_EXTRAS === "true",
    quizScoring: process.env.FF_QUIZ_SCORING === "true",
    safetyClassifier: process.env.SAFETY_CLASSIFIER === "true",
  };
}
