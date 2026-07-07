import { describe, expect, it } from "vitest";
import { bigFiveQuiz, QUIZ_VERSION } from "@/content/quiz/big-five";
import { scoreQuiz } from "@/lib/personality/scoring";

describe("Discover Your Path quiz content", () => {
  it("carries all 25 scenario questions across the five dimensions", () => {
    expect(bigFiveQuiz).toHaveLength(25);
    const byDimension = Object.groupBy(bigFiveQuiz, (q) => q.dimension);
    expect(byDimension.openness).toHaveLength(4);
    expect(byDimension.conscientiousness).toHaveLength(7);
    expect(byDimension.extraversion).toHaveLength(4);
    expect(byDimension.agreeableness).toHaveLength(5);
    expect(byDimension.resilience).toHaveLength(5);
  });

  it("every question offers exactly A/B/C with unique ids", () => {
    const ids = new Set<string>();
    for (const question of bigFiveQuiz) {
      expect(ids.has(question.id)).toBe(false);
      ids.add(question.id);
      expect(question.options.map((o) => o.key)).toEqual(["A", "B", "C"]);
    }
  });
});

describe("scoring stub (OQ2)", () => {
  it("computes nothing until the rubric is confirmed", () => {
    expect(scoreQuiz({ o1: "A" }, QUIZ_VERSION)).toBeNull();
  });
});
