import { describe, expect, it } from "vitest";
import { paths, quoteBanks } from "@/content";
import { parseShiftTarget, type PathContent } from "@/content/schema";
import {
  advance,
  enterPathAt,
  startSession,
  type EngineContext,
} from "@/lib/guidepost/machine";

/**
 * Cross-path permeability (M3). The machine hands the route a `pathShift`
 * marker instead of presenting another path's node itself; the route then
 * calls `enterPathAt` on the destination path's context.
 */

// A minimal source path (shaped like Blue's Stage-3 mismatch moment) with one
// option that shifts to Yellow's entry and one that stays in-path.
const shiftingSource: PathContent = {
  path: "blue",
  contentVersion: "test",
  entryNodeId: "s3",
  nodes: {
    s3: {
      id: "s3",
      kind: "choice",
      stage: 3,
      tone: "grounding",
      juniper: {
        text: "What's going on underneath?",
        adaptable: true,
        sourceRef: "test",
      },
      response: { text: "Got it.", adaptable: false, sourceRef: "test" },
      fallbacks: { stillStuck: "green:welcome" },
      options: [
        { id: "head-full", label: "My head's full", target: "yellow:s1" },
        { id: "stay", label: "Stay here", target: "s4" },
      ],
    },
    s4: { id: "s4", kind: "end", stage: 6, tone: "warm" },
  },
};

const sourceCtx: EngineContext = { content: shiftingSource, quoteBanks };
const yellowCtx: EngineContext = { content: paths.yellow!, quoteBanks };

describe("parseShiftTarget", () => {
  it("parses a well-formed cross-path target", () => {
    expect(parseShiftTarget("yellow:s1")).toEqual({
      path: "yellow",
      nodeId: "s1",
    });
  });

  it("returns null for same-path targets and the @return sentinel", () => {
    expect(parseShiftTarget("s4")).toBeNull();
    expect(parseShiftTarget("@return")).toBeNull();
  });

  it("returns null for an unknown path prefix", () => {
    expect(parseShiftTarget("purple:s1")).toBeNull();
    expect(parseShiftTarget(":s1")).toBeNull();
  });
});

describe("cross-path shift mechanics", () => {
  it("returns a pathShift marker (not a presented node) on a shifting option", () => {
    const start = startSession(sourceCtx, "standard");
    expect(start.state.currentNodeId).toBe("s3");

    const out = advance(
      start.state,
      { type: "option", optionId: "head-full" },
      sourceCtx,
    );
    expect(out.pathShift).toEqual({ path: "yellow", nodeId: "s1" });
    expect(out.done).toBe(false);
    // Only the acknowledgment travels with the shift — no destination lines yet.
    expect(out.messages.map((m) => m.text)).toEqual(["Got it."]);
    // The chosen option is recorded, ready to carry across the shift.
    expect(out.state.choices.s3).toBe("head-full");
  });

  it("shifts via a fallback edge too", () => {
    const start = startSession(sourceCtx, "standard");
    const out = advance(
      start.state,
      { type: "fallback", kind: "stillStuck" },
      sourceCtx,
    );
    expect(out.pathShift).toEqual({ path: "green", nodeId: "welcome" });
  });

  it("does not shift on a same-path option", () => {
    const start = startSession(sourceCtx, "standard");
    const out = advance(
      start.state,
      { type: "option", optionId: "stay" },
      sourceCtx,
    );
    expect(out.pathShift).toBeUndefined();
    expect(out.state.currentNodeId).toBe("s4");
    expect(out.done).toBe(true);
  });

  it("enterPathAt opens the destination path, preserving variant + choices", () => {
    const start = startSession(sourceCtx, "standard");
    const shift = advance(
      start.state,
      { type: "option", optionId: "head-full" },
      sourceCtx,
    );

    const entered = enterPathAt(
      yellowCtx,
      shift.state,
      shift.pathShift!.nodeId,
      shift.messages,
    );
    // Now on Yellow, at its entry node.
    expect(entered.state.path).toBe("yellow");
    expect(entered.state.currentNodeId).toBe("s1");
    // Prior choices survive the hop; no stale fallback detour carries over.
    expect(entered.state.choices.s3).toBe("head-full");
    expect(entered.state.returnTo).toBeUndefined();
    // The acknowledgment is spoken first, then Yellow's opening line(s).
    expect(entered.messages[0]?.text).toBe("Got it.");
    expect(entered.messages.length).toBeGreaterThan(1);
  });
});
