import { describe, expect, it } from "vitest";
import { getRouterOptions, routeEntry } from "@/lib/guidepost/router";
import type { Flags } from "@/lib/flags";

const flagsOff: Flags = {
  bluePath: false,
  redPath: false,
  dashboardExtras: false,
  quizScoring: false,
};

describe("entry router", () => {
  it("offers only Green and Yellow with flags off (M1 default)", () => {
    expect(getRouterOptions(flagsOff).map((o) => o.path)).toEqual([
      "green",
      "yellow",
    ]);
  });

  it("routes selections to their paths", () => {
    expect(routeEntry("green", flagsOff)).toBe("green");
    expect(routeEntry("yellow", flagsOff)).toBe("yellow");
  });

  it("never routes to a flag-gated path while the flag is off", () => {
    expect(routeEntry("blue", flagsOff)).toBeNull();
    expect(routeEntry("red", flagsOff)).toBeNull();
  });

  it("surfaces Blue when its flag is on", () => {
    const withBlue = { ...flagsOff, bluePath: true };
    expect(routeEntry("blue", withBlue)).toBe("blue");
    // Red stays hidden — it has its own double gate.
    expect(routeEntry("red", withBlue)).toBeNull();
  });
});
