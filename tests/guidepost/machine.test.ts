import { describe, expect, it } from "vitest";
import { paths, quoteBanks } from "@/content";
import {
  advance,
  startSession,
  type EngineContext,
} from "@/lib/guidepost/machine";
import {
  EngineInputError,
  type EngineInput,
  type EngineOutput,
} from "@/lib/guidepost/types";
import type { CheckinVariant } from "@/lib/utils/time";

const greenCtx: EngineContext = { content: paths.green!, quoteBanks };
const yellowCtx: EngineContext = { content: paths.yellow!, quoteBanks };

/** Drive a session with a scripted list of inputs; returns every output. */
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

const text = (t = "some things on my mind"): EngineInput => ({
  type: "text",
  text: t,
});
const option = (optionId: string): EngineInput => ({
  type: "option",
  optionId,
});
const tool = (): EngineInput => ({ type: "toolResult" });

describe("Green path — full traversal", () => {
  const throughS5: EngineInput[] = [
    text(), // s1-mind-scan
    tool(), // s1-covey-sort
    text(), // s1-expand
    tool(), // s1-covey-sort-2
    text(), // s2-align
    option("block-time"), // s3-time
    option("add-buffer"), // s4-align-day
  ];

  it("completes standard variant, skipping evening-only nodes", () => {
    const outputs = run(greenCtx, "standard", [
      ...throughS5,
      option("crush-it"), // s5-checkin
      text("finish my lab report"), // s6-goal
      option("add-calendar"), // s6-calendar
      option("quote-0"), // s6-reflect
    ]);
    const last = outputs[outputs.length - 1];
    expect(last.done).toBe(true);
    expect(last.state.currentNodeId).toBe("end");
    // Evening-only nodes must not have produced messages.
    const allText = outputs.flatMap((o) => o.messages.map((m) => m.nodeId));
    expect(allText).not.toContain("s6-evening-tomorrow");
    expect(allText).not.toContain("s6-habit-stack");
    // Opening welcome auto-advanced into the Stage 1 prompt.
    expect(outputs[0].messages.map((m) => m.nodeId)).toEqual([
      "welcome",
      "s1-mind-scan",
    ]);
    expect(outputs[0].freeText).toBe(true);
  });

  it("completes evening variant with wind-down and habit stacking", () => {
    const outputs = run(greenCtx, "evening", [
      ...throughS5,
      option("nervous"),
      text("finish my lab report"),
      option("skip-calendar"),
      option("quote-3"),
      text("pack my bag tonight"), // s6-evening-tomorrow
    ]);
    const last = outputs[outputs.length - 1];
    expect(last.done).toBe(true);
    const nodeIds = outputs.flatMap((o) => o.messages.map((m) => m.nodeId));
    expect(nodeIds).toContain("s6-evening-tomorrow");
    expect(nodeIds).toContain("s6-habit-stack");
    // Evening reflection uses the evening prompt + evening quote bank.
    const reflect = outputs.find((o) => o.state.currentNodeId === "s6-reflect");
    expect(reflect?.messages.at(-1)?.text).toBe(
      "Let’s close the loop on your day.",
    );
    expect(reflect?.quotes).toContain("Today didn’t eat me alive 😤");
  });

  it("walks the Stage 5 processing-changes loop", () => {
    const outputs = run(greenCtx, "standard", [
      ...throughS5,
      option("processing"), // → s5-processing
      option("yes-walk-through"), // → s5-processing-help
      option("missing"), // → s5-processing-missing
      text("my study group meets today"),
    ]);
    const last = outputs[outputs.length - 1];
    expect(last.state.currentNodeId).toBe("s6-goal");
    const visited = outputs.map((o) => o.state.currentNodeId);
    expect(visited).toContain("s5-processing");
    expect(visited).toContain("s5-processing-help");
    expect(visited).toContain("s5-processing-missing");
  });

  it("exposes every Stage 5 option from the doc", () => {
    const outputs = run(greenCtx, "standard", throughS5);
    expect(outputs.at(-1)?.options?.map((o) => o.id)).toEqual([
      "crush-it",
      "nervous",
      "overwhelmed",
      "processing",
      "not-sure",
    ]);
  });
});

describe("Yellow path — every 2A–2E branch reaches the end", () => {
  const tail: EngineInput[] = [
    option("quick-hit"), // s3
    text("soccer practice at 5"), // s4
    option("buffer"), // s4-options
    option("crush-it"), // s5
    text("open the doc"), // s5-first-step
    option("did-it"), // s6
    option("quote-1"), // s6-quote
    option("skip"), // s6-aha-offer
  ];

  const branches: Record<string, EngineInput[]> = {
    "2A physical": [option("physical"), option("water")],
    "2B emotional (talk it out)": [
      option("emotional"),
      option("pause"),
      text("one word: heavy"),
    ],
    "2B emotional (carry)": [option("emotional"), option("carry")],
    "2C overload": [
      option("overload"),
      text("brain dump"),
      tool(),
      text("math first"),
    ],
    "2D procrastination (each resistance type)": [
      option("procrastination"),
      option("fear"),
    ],
    "2E frozen": [option("frozen"), option("breaths")],
  };

  for (const [name, branch] of Object.entries(branches)) {
    it(`completes via ${name}`, () => {
      const outputs = run(yellowCtx, "standard", [...branch, ...tail]);
      const last = outputs[outputs.length - 1];
      expect(last.done).toBe(true);
      expect(last.state.currentNodeId).toBe("end");
    });
  }

  it("2D routes perfectionism and boredom to the authored reframe too", () => {
    for (const resistance of ["perfectionism", "boredom"]) {
      const outputs = run(yellowCtx, "standard", [
        option("procrastination"),
        option(resistance),
      ]);
      const nodeIds = outputs.flatMap((o) => o.messages.map((m) => m.nodeId));
      expect(nodeIds).toContain("s2d-reframe");
    }
  });

  it("emits the authored Stage 1 acknowledgment after selection", () => {
    const outputs = run(yellowCtx, "standard", [option("frozen")]);
    expect(outputs[1].messages[0].text).toBe(
      "You’re not broken. Feeling stuck doesn’t mean you’re lazy—it just means something’s in the way. Let’s explore it.",
    );
    expect(outputs[1].messages[0].adaptable).toBe(false);
  });

  it("saves an Aha! moment via the capture branch", () => {
    const outputs = run(yellowCtx, "standard", [
      option("physical"),
      option("water"),
      option("quick-hit"),
      text(),
      option("buffer"),
      option("crush-it"),
      text(),
      option("aha"),
      option("quote-4"),
      option("save"),
      text("starting small actually works"),
    ]);
    expect(outputs.at(-1)?.done).toBe(true);
  });

  it("'not sure' at Stage 3 detours through the sizing helper", () => {
    const outputs = run(yellowCtx, "standard", [
      option("frozen"),
      option("tidy"),
      option("not-sure"),
      option("chunk-it"),
    ]);
    const visited = outputs.map((o) => o.state.currentNodeId);
    expect(visited).toContain("s3-unsure");
    expect(outputs.at(-1)?.state.currentNodeId).toBe("s4");
  });
});

describe("fallbacks (cross-path spec)", () => {
  it("'I don't know' flips the prompt, then returns to the origin", () => {
    const outputs = run(greenCtx, "standard", [
      { type: "fallback", kind: "idk" },
      text("not this dread feeling"),
    ]);
    expect(outputs[1].state.currentNodeId).toBe("fallback-flip");
    expect(outputs[1].messages.at(-1)?.text).toBe(
      "What do you *not* want to feel today?",
    );
    // @return brings the user back to the Stage 1 prompt.
    expect(outputs[2].state.currentNodeId).toBe("s1-mind-scan");
    expect(outputs[2].state.returnTo).toBeUndefined();
  });

  it("'nothing sounds right' summons the Mini Reset Toolkit and returns", () => {
    const outputs = run(yellowCtx, "standard", [
      { type: "fallback", kind: "nothingSoundsRight" },
      tool(),
    ]);
    expect(outputs[1].tool?.type).toBe("miniResetToolkit");
    expect(outputs[1].tool?.props).toEqual({ toolkit: "yellow" });
    expect(outputs[2].state.currentNodeId).toBe("s1");
  });

  it("'still stuck' re-anchors to the Weekly Horizon", () => {
    const outputs = run(greenCtx, "standard", [
      { type: "fallback", kind: "stillStuck" },
      option("weekly-horizon"),
    ]);
    expect(outputs[1].state.currentNodeId).toBe("fallback-still-stuck");
    expect(outputs[2].state.currentNodeId).toBe("s1-mind-scan");
  });

  it("rejects fallbacks a node doesn't declare", () => {
    const start = startSession(yellowCtx, "standard");
    const atS2a = advance(start.state, option("physical"), yellowCtx);
    expect(() =>
      advance(atS2a.state, { type: "fallback", kind: "idk" }, yellowCtx),
    ).toThrow(EngineInputError);
  });
});

describe("input validation", () => {
  it("rejects the wrong input type for a node", () => {
    const start = startSession(yellowCtx, "standard");
    expect(() => advance(start.state, text(), yellowCtx)).toThrow(
      EngineInputError,
    );
  });

  it("rejects unknown option ids", () => {
    const start = startSession(yellowCtx, "standard");
    expect(() => advance(start.state, option("nope"), yellowCtx)).toThrow(
      EngineInputError,
    );
  });

  it("rejects input on a finished session", () => {
    const outputs = run(yellowCtx, "standard", [
      option("physical"),
      option("water"),
      option("quick-hit"),
      text(),
      option("buffer"),
      option("crush-it"),
      text(),
      option("did-it"),
      option("quote-0"),
      option("skip"),
    ]);
    expect(outputs.at(-1)?.done).toBe(true);
    expect(() =>
      advance(outputs.at(-1)!.state, option("skip"), yellowCtx),
    ).toThrow(EngineInputError);
  });
});
