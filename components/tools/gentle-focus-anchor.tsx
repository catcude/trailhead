"use client";

import { Button } from "@/components/ui/button";

/**
 * Gentle Focus Anchor — a brief sensory grounding / refocus beat. The actual
 * grounding and movement cues are a gap (G-T1) and stay hidden until Cat
 * writes them, so this renders only the confirm: the student takes the beat
 * Juniper offered, then continues. No timers, no pressure.
 */
export interface GentleFocusResult {
  anchored: boolean;
}

export function GentleFocusAnchor({
  onDone,
  disabled,
}: {
  onDone: (result: GentleFocusResult) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-sand/40 bg-calm/10 p-4">
      <Button
        type="button"
        onClick={() => onDone({ anchored: true })}
        disabled={disabled}
      >
        I’m back
      </Button>
    </div>
  );
}
