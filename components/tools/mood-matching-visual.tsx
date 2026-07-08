"use client";

import { useState } from "react";
import { dialogueTools } from "@/content/tools/dialogue-tools";
import { Button } from "@/components/ui/button";

/**
 * Mood-Matching Visual — name your current state. The actual color wheel /
 * metaphor deck items are a gap (G-B2): the picker only renders when Cat has
 * supplied items, otherwise the section is hidden and the student simply
 * continues. No fabricated moods.
 */
export interface MoodResult {
  mood: string | null;
}

export function MoodMatchingVisual({
  onDone,
  disabled,
}: {
  onDone: (result: MoodResult) => void;
  disabled?: boolean;
}) {
  const { items } = dialogueTools.moodMatchingVisual;
  const [chosen, setChosen] = useState<string | null>(null);
  const hasItems = items.length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-sand/40 bg-white p-4">
      {hasItems ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => setChosen(item.id)}
              className={`min-h-11 rounded-full border px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-depth ${
                chosen === item.id
                  ? "border-cta bg-coral/20 font-semibold text-depth"
                  : "border-sand/60 text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      <Button
        type="button"
        onClick={() => onDone({ mood: chosen })}
        disabled={disabled || (hasItems && chosen === null)}
      >
        Continue
      </Button>
    </div>
  );
}
