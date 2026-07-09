import { describe, expect, it } from "vitest";
import { paths, quoteBanks } from "@/content";
import {
  advance,
  enterPathAt,
  startSession,
  type EngineContext,
} from "@/lib/guidepost/machine";
import type { EngineInput, EngineOutput } from "@/lib/guidepost/types";
import type { CheckinVariant } from "@/lib/utils/time";

const blueCtx: EngineContext = { content: paths.blue!, quoteBanks };

function run(
  ctx: EngineContext,
  variant: CheckinVariant,
  inputs: EngineInput[],
): EngineOutput[] {
  const outputs = [startSession(ctx, variant)];
  for (const input of inputs) {
    outputs.push(advance(outputs[outputs.length - 1].state, input, ctx));
  }
  return outputs;
}

const option = (optionId: string): EngineInput => ({
  type: "option",
  optionId,
});
const tool = (): EngineInput => ({ type: "toolResult" });

describe("Blue path — structure", () => {
  it("opens at Stage 1 with the three Surface Scan options", () => {
    const start = startSession(blueCtx, "standard");
    expect(start.state.currentNodeId).toBe("s1");
    expect(start.stage).toBe(1);
    expect(start.options?.map((o) => o.id)).toEqual([
      "stay-here",
      "deeper",
      "maybe-not",
    ]);
  });

  it("'staying right here' routes straight to gentle closure", () => {
    const [, stay] = run(blueCtx, "standard", [option("stay-here")]);
    expect(stay.state.currentNodeId).toBe("s6");
    expect(stay.messages.map((m) => m.nodeId)).toEqual(["s1-stay", "s6"]);
  });

  it("'check in deeper' flows into the Subtle Signals metaphors", () => {
    const [, deeper] = run(blueCtx, "standard", [option("deeper")]);
    expect(deeper.state.currentNodeId).toBe("s2");
    expect(deeper.options?.map((o) => o.id)).toEqual([
      "numb",
      "autopilot",
      "boxed-in",
      "faking",
      "managing",
    ]);
  });
});

describe("Blue Stage 3 — the four Mismatch branches", () => {
  const toS3 = [option("deeper"), option("numb")];

  it("'head full' shifts to Yellow", () => {
    const outs = run(blueCtx, "standard", [...toS3, option("head-full")]);
    expect(outs[outs.length - 1].pathShift).toEqual({
      path: "yellow",
      nodeId: "s1",
    });
  });

  it("'heart loud' takes the authored interim into Quiet Needspotting (Red gated)", () => {
    const outs = run(blueCtx, "standard", [...toS3, option("heart-loud")]);
    const last = outs[outs.length - 1];
    expect(last.pathShift).toBeUndefined();
    expect(last.state.currentNodeId).toBe("s4");
    expect(last.tool?.type).toBe("microNeedsMenu");
    // Bridge line spoken before the needspotting prompt — never a dead-end.
    expect(last.messages.map((m) => m.nodeId)).toEqual([
      "s3-heart-interim",
      "s4",
    ]);
  });

  it("'body tired' and 'I don't know' both reach Quiet Needspotting", () => {
    for (const id of ["body-tired", "dont-know"]) {
      const outs = run(blueCtx, "standard", [...toS3, option(id)]);
      expect(outs[outs.length - 1].state.currentNodeId).toBe("s4");
    }
  });
});

describe("Blue Stage 6 — the four closure exits", () => {
  // deeper → numb → dont-know → s4(tool) → s5 → rest → s6
  const toS6 = [
    option("deeper"),
    option("numb"),
    option("dont-know"),
    tool(),
    option("rest"),
  ];

  it("'good here' → reflection pick from the Blue bank → end", () => {
    const outs = run(blueCtx, "standard", [
      ...toS6,
      option("good-here"),
      option("quote-0"),
    ]);
    const reflect = outs[outs.length - 2];
    expect(reflect.state.currentNodeId).toBe("s6-reflect");
    expect(reflect.quotes?.[0]).toBe("I noticed something I’d been ignoring.");
    const end = outs[outs.length - 1];
    expect(end.done).toBe(true);
    expect(end.state.currentNodeId).toBe("end");
  });

  it("'keep exploring' shifts to Yellow; 'ready to tackle' shifts to Green", () => {
    const y = run(blueCtx, "standard", [...toS6, option("explore-yellow")]);
    expect(y[y.length - 1].pathShift).toEqual({ path: "yellow", nodeId: "s1" });
    const g = run(blueCtx, "standard", [...toS6, option("ready-green")]);
    expect(g[g.length - 1].pathShift).toEqual({
      path: "green",
      nodeId: "welcome",
    });
  });

  it("'something grounding' passes through the hidden G-B3 slot to reflection", () => {
    const outs = run(blueCtx, "standard", [...toS6, option("grounding")]);
    const last = outs[outs.length - 1];
    expect(last.state.currentNodeId).toBe("s6-reflect");
    expect(last.quotes?.length).toBe(5);
  });
});

describe("Blue path — completeness", () => {
  it("completes end-to-end in the evening variant too", () => {
    const outs = run(blueCtx, "evening", [
      option("maybe-not"),
      option("faking"),
      option("body-tired"),
      tool(), // s4 micro-needs
      option("small-task"),
      tool(), // s5 start-small-planner
      option("good-here"),
      option("quote-1"),
    ]);
    expect(outs[outs.length - 1].done).toBe(true);
  });

  it("a shift out of Blue lands correctly when the route enters the target", () => {
    const outs = run(blueCtx, "standard", [
      option("deeper"),
      option("numb"),
      option("head-full"),
    ]);
    const shift = outs[outs.length - 1];
    const entered = enterPathAt(
      { content: paths.yellow!, quoteBanks },
      shift.state,
      shift.pathShift!.nodeId,
      shift.messages,
    );
    expect(entered.state.path).toBe("yellow");
    expect(entered.state.currentNodeId).toBe("s1");
  });
});
