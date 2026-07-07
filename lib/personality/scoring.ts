import type { Dimension } from "@/content/quiz/big-five";

/**
 * Discover Your Path scoring — INTERFACE ONLY.
 *
 * BLOCKED ON OQ2: the rubric mapping A/B/C answers → dimension scores →
 * concrete Juniper tone adjustments needs Cat/the team before any score is
 * computed or shown. Raw answers are stored with quiz_version, so profiles
 * are computable retroactively the day the rubric lands. FF_QUIZ_SCORING
 * stays off until then.
 *
 * Hard rule from the PRD: the profile informs tone; it never boxes the user
 * in or appears as a label ("you're an introvert") in dialogue.
 */
export type QuizAnswers = Record<string, "A" | "B" | "C">;

export type PersonalityScores = Record<Dimension, number>;

export function scoreQuiz(
  _answers: QuizAnswers,
  _quizVersion: string,
): PersonalityScores | null {
  // OQ2: no rubric yet — deliberately unscored.
  return null;
}
