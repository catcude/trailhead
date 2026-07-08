import type { ContentNode } from "@/content/schema";

/**
 * Reflective-depth cap (PRD §6.3: "pathways cap reflective depth"; resolved
 * D4: cap = 3). To keep the app from pulling a student deeper than it should,
 * after this many consecutive emotional-probe free-text turns Juniper offers a
 * grounding reset instead of another probing question.
 *
 * This module is the pure decision layer; the machine applies it. A node opts
 * into probe-counting via `emotionalProbe: true` and names its reset via
 * `depthResetTo`. Until Cat confirms the qualifying nodes and the
 * non-dismissive transition copy, no node opts in and the cap is inert.
 */
export const REFLECTIVE_DEPTH_CAP = 3;

/**
 * Depth after answering `answered`: one deeper if it was an emotional probe,
 * otherwise reset to zero (the streak is broken by any non-probe turn).
 */
export function bumpProbeDepth(
  current: number | undefined,
  answered: ContentNode,
): number {
  return answered.emotionalProbe ? (current ?? 0) + 1 : 0;
}

/** True once the streak has reached the cap. */
export function reachedDepthCap(depth: number): boolean {
  return depth >= REFLECTIVE_DEPTH_CAP;
}

/**
 * Whether answering `answered` should divert to a grounding reset rather than
 * continue to another probe: the node opts in, names a reset, and the streak
 * has hit the cap.
 */
export function shouldOfferReset(
  answered: ContentNode,
  depthAfter: number,
): boolean {
  return Boolean(
    answered.emotionalProbe &&
    answered.depthResetTo &&
    reachedDepthCap(depthAfter),
  );
}
