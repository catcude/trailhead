import { z } from "zod";

/**
 * Guidepost content schema — the hybrid content model's data half.
 *
 * Everything user-facing here is Cat's authored IP, entered VERBATIM from
 * docs/paths/ (typographic punctuation preserved). The state machine in
 * lib/guidepost/ owns flow; the LLM (M2) may only rephrase nodes where
 * `adaptable: true`, and never reflection quotes or safety content.
 *
 * Strings drafted by the team (not Cat) are marked with `needsCat: true`
 * and surfaced in docs/content-review/ for her approval.
 */

export const PathIdSchema = z.enum(["green", "yellow", "blue", "red"]);
export type PathId = z.infer<typeof PathIdSchema>;

export const StageSchema = z.number().int().min(1).max(6);

/** Tone tags come from the per-path cheat sheets; registry in content/tone. */
export const ToneTagSchema = z.string().min(1);

export const ToolTypeSchema = z.enum([
  "coveyQuadrantSorter",
  "miniResetToolkit",
  "startSmallPlanner",
  "microNeedsMenu",
  "moodMatchingVisual",
  "gentleFocusAnchor",
  "ahaTracker",
  "eveningWindDown",
]);
export type ToolType = z.infer<typeof ToolTypeSchema>;

export const JuniperTextSchema = z.object({
  /** Verbatim authored line (standard variant). */
  text: z.string().min(1),
  /** Verbatim evening (5–10 PM) variant, when the docs specify one. */
  evening: z.string().min(1).optional(),
  /** May the LLM rephrase toward the calibrated tone (M2)? Quotes/safety: never. */
  adaptable: z.boolean(),
  /** Where in docs/ this text comes from, e.g. "paths/green-path.md §Stage 1". */
  sourceRef: z.string().min(1),
  /** True when the copy is a team draft awaiting Cat's approval. */
  needsCat: z.boolean().optional(),
});
export type JuniperText = z.infer<typeof JuniperTextSchema>;

export const OptionSchema = z.object({
  id: z.string().min(1),
  /** Verbatim user-facing label (authored unless needsCat). */
  label: z.string().min(1),
  target: z.string().min(1),
  needsCat: z.boolean().optional(),
});
export type Option = z.infer<typeof OptionSchema>;

/**
 * Cross-path fallback edges (CLAUDE.md): "I don't know" flips the prompt;
 * "nothing sounds right" offers a micro-reset; still stuck re-anchors to
 * the Weekly Horizon.
 */
export const FallbacksSchema = z.object({
  idk: z.string().min(1).optional(),
  nothingSoundsRight: z.string().min(1).optional(),
  stillStuck: z.string().min(1).optional(),
});

/**
 * Tip-box slot. When the authored body is a known gap (e.g. G-G1), the slot
 * ships with `gapRef` and no body — the UI hides empty tips until Cat's copy
 * lands.
 */
export const TipSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  sourceRef: z.string().min(1),
  gapRef: z.string().min(1).optional(),
  needsCat: z.boolean().optional(),
});
export type Tip = z.infer<typeof TipSchema>;

/** Target sentinel: return to the node that triggered a fallback detour. */
export const RETURN_TARGET = "@return";

/**
 * A cross-path shift target is written "<path>:<nodeId>" (e.g. "yellow:s1").
 * Returns the parsed path + node when the string is a well-formed shift target
 * for a known path, else null (ordinary same-path targets and "@return").
 * The state machine uses this to hand a permeability shift back to the route;
 * only the route (never the LLM) then swaps the active path.
 */
export function parseShiftTarget(
  target: string,
): { path: PathId; nodeId: string } | null {
  const idx = target.indexOf(":");
  if (idx <= 0) return null;
  const parsed = PathIdSchema.safeParse(target.slice(0, idx));
  const nodeId = target.slice(idx + 1);
  if (!parsed.success || !nodeId) return null;
  return { path: parsed.data, nodeId };
}

const NodeBase = z.object({
  id: z.string().min(1),
  stage: StageSchema,
  tone: ToneTagSchema,
  juniper: JuniperTextSchema.optional(),
  /** Juniper's acknowledgment spoken AFTER the user's input on this node. */
  response: JuniperTextSchema.optional(),
  tip: TipSchema.optional(),
  /** Node only appears in one check-in variant (e.g. evening wind-down). */
  variantOnly: z.enum(["standard", "evening"]).optional(),
  fallbacks: FallbacksSchema.optional(),
  /**
   * Reflective-depth cap (PRD §6.3, D4). Mark a free-text node as an
   * emotional probe so consecutive probe turns are counted; once the cap is
   * reached the machine diverts to `depthResetTo` (a grounding reset) instead
   * of another probe. Which nodes qualify — and the non-dismissive transition
   * copy — are pending Cat (docs/content-review/m2-for-cat.md); until a node
   * opts in, the cap is inert.
   */
  emotionalProbe: z.boolean().optional(),
  /** Divert target when the reflective-depth cap is hit (usually a mini-reset). */
  depthResetTo: z.string().min(1).optional(),
});

export const NodeSchema = z.discriminatedUnion("kind", [
  /** Juniper speaks, user picks one option. */
  NodeBase.extend({
    kind: z.literal("choice"),
    options: z.array(OptionSchema).min(1),
  }),
  /** Juniper speaks, user types (screened by lib/llm/safety before anything else). */
  NodeBase.extend({
    kind: z.literal("freeText"),
    next: z.string().min(1),
  }),
  /** Summons a structured in-dialogue tool (never a text blob). */
  NodeBase.extend({
    kind: z.literal("tool"),
    tool: z.object({
      type: ToolTypeSchema,
      props: z.record(z.string(), z.unknown()).optional(),
    }),
    next: z.string().min(1),
  }),
  /** Juniper speaks, then auto-advances. */
  NodeBase.extend({
    kind: z.literal("message"),
    next: z.string().min(1),
  }),
  /** Outcome-matched reflection pick from a quote bank. */
  NodeBase.extend({
    kind: z.literal("reflection"),
    quoteBank: PathIdSchema,
    next: z.string().min(1),
  }),
  /** Terminal node. */
  NodeBase.extend({
    kind: z.literal("end"),
  }),
]);
export type ContentNode = z.infer<typeof NodeSchema>;

export const PathContentSchema = z.object({
  path: PathIdSchema,
  contentVersion: z.string().min(1),
  entryNodeId: z.string().min(1),
  nodes: z.record(z.string(), NodeSchema),
});
export type PathContent = z.infer<typeof PathContentSchema>;

export const QuoteBankSchema = z.object({
  path: PathIdSchema,
  sourceRef: z.string().min(1),
  /** Verbatim quotes; never LLM-generated, never rephrased. */
  standard: z.array(z.string().min(1)).min(1),
  evening: z.array(z.string().min(1)).min(1),
});
export type QuoteBank = z.infer<typeof QuoteBankSchema>;

/** Targets of node edges: option targets, next, fallbacks. */
function edgeTargets(node: ContentNode): string[] {
  const targets: string[] = [];
  if (node.kind === "choice")
    targets.push(...node.options.map((o) => o.target));
  if ("next" in node) targets.push(node.next);
  if (node.fallbacks) {
    for (const t of Object.values(node.fallbacks)) if (t) targets.push(t);
  }
  if (node.depthResetTo) targets.push(node.depthResetTo);
  return targets;
}

export interface ContentIssue {
  nodeId: string;
  problem: string;
}

/**
 * Structural validation: schema-valid, all edges resolve, entry exists,
 * every node reachable from the entry, at least one end node reachable.
 * Cross-path shift targets (e.g. "yellow:s1") are validated against the
 * set of known external entry ids passed in.
 */
export function validatePathContent(
  content: PathContent,
  externalTargets: ReadonlySet<string> = new Set(),
): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const parsed = PathContentSchema.safeParse(content);
  if (!parsed.success) {
    return parsed.error.issues.map((issue) => ({
      nodeId: issue.path.join("."),
      problem: issue.message,
    }));
  }

  const { nodes, entryNodeId } = content;
  if (!nodes[entryNodeId]) {
    issues.push({ nodeId: entryNodeId, problem: "entry node missing" });
    return issues;
  }

  for (const node of Object.values(nodes)) {
    for (const target of edgeTargets(node)) {
      if (target === RETURN_TARGET) continue;
      if (!nodes[target] && !externalTargets.has(target)) {
        issues.push({
          nodeId: node.id,
          problem: `edge target "${target}" does not exist`,
        });
      }
    }
    if (node.id !== node.id.trim()) {
      issues.push({ nodeId: node.id, problem: "node id has whitespace" });
    }
  }

  // Reachability from entry.
  const seen = new Set<string>([entryNodeId]);
  const queue = [entryNodeId];
  while (queue.length > 0) {
    const current = nodes[queue.pop() as string];
    if (!current) continue;
    for (const target of edgeTargets(current)) {
      if (nodes[target] && !seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  for (const id of Object.keys(nodes)) {
    if (!seen.has(id)) {
      issues.push({ nodeId: id, problem: "unreachable from entry" });
    }
  }
  const reachesEnd = [...seen].some((id) => nodes[id]?.kind === "end");
  if (!reachesEnd) {
    issues.push({ nodeId: entryNodeId, problem: "no end node reachable" });
  }

  return issues;
}
