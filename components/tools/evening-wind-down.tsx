"use client";

import { useState } from "react";
import { dialogueTools } from "@/content/tools/dialogue-tools";
import { Button } from "@/components/ui/button";

/**
 * Evening Wind Down Prompts — end-of-day reflection. The three options
 * (preview next day / habit stack / pause with intention) are authored; the
 * prompt set behind each is a gap (G-T3) and stays hidden until Cat writes it,
 * so this records the chosen mode and hands back to the flow.
 */
export interface EveningWindDownResult {
  choice: string | null;
}

export function EveningWindDown({
  onDone,
  disabled,
}: {
  onDone: (result: EveningWindDownResult) => void;
  disabled?: boolean;
}) {
  const { items } = dialogueTools.eveningWindDown;
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-sand/40 bg-lavender/10 p-4">
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setChosen(item.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-depth ${
                chosen === item.id
                  ? "border-cta bg-coral/20 text-depth"
                  : "border-sand/50 bg-white text-ink"
              }`}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        onClick={() => onDone({ choice: chosen })}
        disabled={disabled || chosen === null}
      >
        Wind down
      </Button>
    </div>
  );
}
