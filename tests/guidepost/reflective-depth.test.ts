import { describe, expect, it } from "vitest";
import type { PathContent } from "@/content/schema";
import {
  advance,
  startSession,
  type EngineContext,
} from "@/lib/guidepost/machine";
import {
  REFLECTIVE_DEPTH_CAP,
  bumpProbeDepth,
  shouldOfferReset,
} from "@/lib/guidepost/reflective-depth";

const probe = (id: string, next: string) => ({
  id,
  kind: "freeText" as const,
  stage: 2,
  tone: "practical",
  emotionalProbe: true,
  depthResetTo: "reset",
  next,
  juniper: { text: `probe ${id}`, adaptable: true, sourceRef: "test" },
});

const content: PathContent = {
  path: "yellow",
  contentVersion: "test",
  entryNodeId: "p1",
  nodes: {
    p1: probe("p1", "p2"),
    p2: probe("p2", "p3"),
    p3: probe("p3", "done"),
    reset: { id: "reset", kind: "end", stage: 2, tone: "grounding" },
    done: { id: "done", kind: "end", stage: 2, tone: "warm" },
  },
};
const ctx: EngineContext = { content, quoteBanks: {} };

describe("reflective-depth pure decisions", () => {
  it("increments on a probe turn and resets on a non-probe turn", () => {
    expect(bumpProbeDepth(1, content.nodes.p1)).toBe(2);
    const notProbe = { ...content.nodes.p1, emotionalProbe: false };
    expect(bumpProbeDepth(5, notProbe)).toBe(0);
  });

  it("offers a reset only at the cap and only when a reset target exists", () => {
    expect(shouldOfferReset(content.nodes.p1, REFLECTIVE_DEPTH_CAP)).toBe(true);
    expect(shouldOfferReset(content.nodes.p1, REFLECTIVE_DEPTH_CAP - 1)).toBe(
      false,
    );
    const noTarget = { ...content.nodes.p1, depthResetTo: undefined };
    expect(shouldOfferReset(noTarget, REFLECTIVE_DEPTH_CAP)).toBe(false);
  });
});

describe("machine diverts to a grounding reset at the cap", () => {
  it("after 3 consecutive probe turns, lands on the reset (not the next probe)", () => {
    let state = startSession(ctx, "standard").state;
    // Turn 1 → p2, depth 1
    let out = advance(state, { type: "text", text: "a" }, ctx);
    expect(out.state.currentNodeId).toBe("p2");
    expect(out.state.probeDepth).toBe(1);
    // Turn 2 → p3, depth 2
    out = advance(out.state, { type: "text", text: "b" }, ctx);
    expect(out.state.currentNodeId).toBe("p3");
    expect(out.state.probeDepth).toBe(2);
    // Turn 3 → cap reached → divert to reset, depth cleared
    out = advance(out.state, { type: "text", text: "c" }, ctx);
    expect(out.state.currentNodeId).toBe("reset");
    expect(out.state.probeDepth).toBe(0);
    state = out.state;
    expect(state.done).toBe(true);
  });
});
