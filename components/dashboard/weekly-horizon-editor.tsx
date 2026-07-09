"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setWeeklyHorizon } from "@/app/(app)/dashboard/actions";

/**
 * Weekly Horizon Planner (minimal, WS6) — a short list of this week's
 * intentions. The anchor other flows reference: the check-in's still-stuck
 * fallback reads these back. Full planner UI is M3.
 */
export function WeeklyHorizonEditor({ initial }: { initial: string[] }) {
  const [items, setItems] = useState<string[]>(
    initial.length > 0 ? initial : [""],
  );
  const [pending, start] = useTransition();

  function update(i: number, value: string) {
    setItems((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((value, i) => (
        <input
          key={i}
          type="text"
          value={value}
          onChange={(e) => update(i, e.target.value)}
          placeholder="An intention for this week…"
          className="min-h-11 w-full rounded-lg border border-sand/60 px-3 text-sm focus-visible:outline-2 focus-visible:outline-depth"
        />
      ))}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setItems((prev) => [...prev, ""])}
          disabled={pending || items.length >= 10}
        >
          + Add another
        </Button>
        <Button
          type="button"
          onClick={() => start(() => setWeeklyHorizon(items))}
          disabled={pending}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
