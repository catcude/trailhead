import { describe, expect, it } from "vitest";
import { computeStreak } from "@/lib/utils/streak";
import { currentWeekStart } from "@/lib/utils/week";

describe("computeStreak (gentle)", () => {
  it("counts consecutive days ending today", () => {
    expect(
      computeStreak(["2026-07-06", "2026-07-07", "2026-07-08"], "2026-07-08"),
    ).toBe(3);
  });

  it("still counts a streak that ends yesterday (no shame reset at midnight)", () => {
    expect(computeStreak(["2026-07-06", "2026-07-07"], "2026-07-08")).toBe(2);
  });

  it("is zero when neither today nor yesterday is checked", () => {
    expect(computeStreak(["2026-07-01"], "2026-07-08")).toBe(0);
  });

  it("breaks the streak on a gap", () => {
    expect(
      computeStreak(["2026-07-04", "2026-07-06", "2026-07-07"], "2026-07-07"),
    ).toBe(2);
  });

  it("is zero with no checks", () => {
    expect(computeStreak([], "2026-07-08")).toBe(0);
  });

  it("ignores duplicate check dates", () => {
    expect(computeStreak(["2026-07-08", "2026-07-08"], "2026-07-08")).toBe(1);
  });
});

describe("currentWeekStart (ISO Monday, UTC)", () => {
  it("returns Monday for a mid-week date", () => {
    // 2026-07-08 is a Wednesday → Monday 2026-07-06.
    expect(currentWeekStart(new Date("2026-07-08T12:00:00Z"))).toBe(
      "2026-07-06",
    );
  });

  it("returns the same day when it is Monday", () => {
    expect(currentWeekStart(new Date("2026-07-06T00:00:00Z"))).toBe(
      "2026-07-06",
    );
  });

  it("maps Sunday back to the prior Monday", () => {
    // 2026-07-12 is a Sunday → Monday 2026-07-06.
    expect(currentWeekStart(new Date("2026-07-12T23:00:00Z"))).toBe(
      "2026-07-06",
    );
  });
});
