"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { bigFiveQuiz } from "@/content/quiz/big-five";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Discover Your Path — skippable stepper, one question at a time,
 * no time pressure. "Explore the App First" is always available (PRD §3.4).
 */
export function QuizClient({
  onFinish,
}: {
  onFinish: (answers: Record<string, string>) => Promise<void>;
}) {
  const [index, setIndex] = useState(-1); // -1 = intro screen
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();

  const question = index >= 0 ? bigFiveQuiz[index] : null;
  const total = bigFiveQuiz.length;

  function answer(key: string) {
    if (!question) return;
    const next = { ...answers, [question.id]: key };
    setAnswers(next);
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      startSaving(() => onFinish(next));
    }
  }

  const skip = (
    <Link
      href="/dashboard"
      className="text-center text-sm font-medium text-info underline-offset-4 hover:underline"
    >
      Explore the App First
    </Link>
  );

  if (!question) {
    return (
      <Card className="mx-auto flex w-full max-w-md flex-col gap-4">
        <h1 className="text-2xl font-semibold text-depth">
          Discover Your Path
        </h1>
        {/* NEEDS-CAT (G-O1): quiz intro in Juniper's voice. Confidentiality
            promise wording follows the PRD and is backed by owner-only RLS. */}
        <p className="text-sm">
          A few quick either-or questions — about five minutes — that teach
          Juniper how you like to be talked to. There are no wrong answers and
          no grades.
        </p>
        <p className="text-sm">
          Your answers are confidential and used only to shape your experience.
          You can retake this anytime from settings.
        </p>
        <Button onClick={() => setIndex(0)}>Start the quiz</Button>
        {skip}
      </Card>
    );
  }

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col gap-4">
      <p className="text-xs text-ink/60">
        {index + 1} of {total}
      </p>
      <h1 className="text-lg font-semibold text-depth">{question.prompt}</h1>
      <div className="flex flex-col gap-2">
        {question.options.map((option) => (
          <button
            key={option.key}
            type="button"
            disabled={saving}
            onClick={() => answer(option.key)}
            className="min-h-11 rounded-[var(--radius-card)] border border-sand/60 bg-white px-4 py-2.5 text-left text-sm transition-colors hover:border-cta hover:bg-coral/10 focus-visible:outline-2 focus-visible:outline-depth"
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        {index > 0 ? (
          <button
            type="button"
            onClick={() => setIndex(index - 1)}
            className="text-sm text-ink/60 hover:text-depth"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        {skip}
      </div>
    </Card>
  );
}
