import type { PathId, Tip, ToolType } from "@/content/schema";
import type { CheckinVariant } from "@/lib/utils/time";

/** Serialized into chat_sessions.state — the server is the source of truth. */
export interface SessionState {
  path: PathId;
  variant: CheckinVariant;
  currentNodeId: string;
  /** Where to resume after a fallback detour (nodes targeting "@return"). */
  returnTo?: string;
  /** Option ids chosen, keyed by node id (feeds tone calibration in M2). */
  choices: Record<string, string>;
  /**
   * Consecutive emotional-probe free-text turns (reflective-depth cap, D4).
   * Backward-compatible: absent on old sessions is treated as 0.
   */
  probeDepth?: number;
  done: boolean;
}

export type FallbackKind = "idk" | "nothingSoundsRight" | "stillStuck";

export type EngineInput =
  | { type: "start" }
  | { type: "option"; optionId: string }
  | { type: "text"; text: string }
  | { type: "toolResult"; payload?: unknown }
  | { type: "fallback"; kind: FallbackKind };

export interface JuniperMessage {
  nodeId: string;
  text: string;
  /** May the LLM rephrase this (M2)? Verbatim provider ignores it. */
  adaptable: boolean;
}

export interface EngineOutput {
  state: SessionState;
  /** Juniper's lines to render, in order (acknowledgment then next prompt). */
  messages: JuniperMessage[];
  /** Present when the current node is a choice. */
  options?: { id: string; label: string }[];
  /** Present when the current node summons a structured tool. */
  tool?: { type: ToolType; props?: Record<string, unknown> };
  /** Present when the current node offers a reflection quote pick. */
  quotes?: string[];
  tip?: Tip;
  /** Fallback escape hatches the current node declares. */
  fallbacks?: FallbackKind[];
  /**
   * Set when the chosen edge shifts to another path (permeability, M3). The
   * machine cannot present another path's content itself, so it returns this
   * marker plus any acknowledgment lines; the route swaps the active path,
   * checks the target path's flag, records the hop, and presents the target
   * node. `messages` on a shift output carry only the acknowledgment.
   */
  pathShift?: { path: PathId; nodeId: string };
  /** The current node accepts free text. */
  freeText: boolean;
  stage: number;
  toneTag: string;
  done: boolean;
}

/** Thrown on inputs that don't fit the current node (API answers 400). */
export class EngineInputError extends Error {}
