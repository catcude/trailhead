"use client";

import { useState } from "react";
import { dialogueTools } from "@/content/tools/dialogue-tools";
import { Button } from "@/components/ui/button";

/**
 * Micro-Needs Menu — tap the small thing you need right now. Items are Cat's
 * authored seeds (stretch / silence / reassurance); per-item responses are a
 * gap (G-T2) and stay hidden until she writes them. Structured UI, one-thumb.
 */
export interface MicroNeedResult {
  need: string | null;
}

export function MicroNeedsMenu({
  onDone,
  disabled,
}: {
  onDone: (result: MicroNeedResult) => void;
  disabled?: boolean;
}) {
  const { items } = dialogueTools.microNeedsMenu;
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-sand/40 bg-calm/10 p-4">
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
      <Button
        type="button"
        onClick={() => onDone({ need: chosen })}
        disabled={disabled}
      >
        {chosen ? "That’s what I need" : "I’m okay for now"}
      </Button>
    </div>
  );
}
