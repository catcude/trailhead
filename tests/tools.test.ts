import { describe, expect, it } from "vitest";
import { dialogueTools } from "@/content/tools/dialogue-tools";
import { ToolTypeSchema } from "@/content/schema";

/**
 * In-dialogue tool content contract (WS5). Rendering is exercised end-to-end
 * by the Playwright pass (WS8); here we pin the data every tool component
 * reads: authored descriptions present, gap slots explicitly empty, and every
 * ToolType enumerated by the schema is accounted for.
 */
describe("dialogue tools content", () => {
  it("every tool has a non-empty authored description", () => {
    for (const [id, tool] of Object.entries(dialogueTools)) {
      expect(tool.description.length, id).toBeGreaterThan(0);
      expect(tool.sourceRef.length, id).toBeGreaterThan(0);
    }
  });

  it("micro-needs seeds are Cat's authored items", () => {
    expect(dialogueTools.microNeedsMenu.items.map((i) => i.id)).toEqual([
      "stretch",
      "silence",
      "reassurance",
    ]);
  });

  it("evening wind-down exposes the three authored options", () => {
    expect(dialogueTools.eveningWindDown.items.map((i) => i.id)).toEqual([
      "preview-next-day",
      "habit-stack",
      "pause-with-intention",
    ]);
  });

  it("mood-matching visual ships as a hidden gap (no invented items)", () => {
    expect(dialogueTools.moodMatchingVisual.items).toEqual([]);
    expect(dialogueTools.moodMatchingVisual.gapRef).toBe("G-B2");
  });

  it("gap-bearing tools carry a needsCat marker", () => {
    for (const id of [
      "startSmallPlanner",
      "microNeedsMenu",
      "gentleFocusAnchor",
      "moodMatchingVisual",
      "eveningWindDown",
    ] as const) {
      expect(dialogueTools[id].needsCat, id).toBe(true);
    }
  });

  it("the schema enumerates a type for every built tool", () => {
    const toolTypes = ToolTypeSchema.options;
    // The six WS5 tools plus the two M1 tools = all eight enumerated types.
    for (const t of [
      "startSmallPlanner",
      "microNeedsMenu",
      "gentleFocusAnchor",
      "moodMatchingVisual",
      "eveningWindDown",
      "ahaTracker",
      "coveyQuadrantSorter",
      "miniResetToolkit",
    ]) {
      expect(toolTypes).toContain(t);
    }
  });
});
