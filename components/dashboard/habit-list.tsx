"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  archiveHabit,
  createHabit,
  toggleHabitToday,
} from "@/app/(app)/dashboard/actions";

export interface HabitView {
  id: string;
  title: string;
  checkedToday: boolean;
  streak: number;
}

/**
 * Habit Tracker (WS6). Tap to check today; streak shows a number with no
 * shame messaging on reset (CLAUDE.md Streak System). Add and archive habits.
 */
export function HabitList({ habits }: { habits: HabitView[] }) {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {habits.map((h) => (
          <li
            key={h.id}
            className="flex items-center gap-3 rounded-lg border border-sand/50 bg-white px-3 py-2"
          >
            <button
              type="button"
              aria-pressed={h.checkedToday}
              disabled={pending}
              onClick={() => start(() => toggleHabitToday(h.id))}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-depth ${
                h.checkedToday
                  ? "border-cta bg-cta text-white"
                  : "border-sand/70 text-transparent"
              }`}
            >
              ✓
            </button>
            <span className="flex-1 text-sm">{h.title}</span>
            <span className="text-xs text-ink/60">
              {h.streak > 0 ? `${h.streak}-day streak` : "fresh start"}
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() => start(() => archiveHabit(h.id))}
              className="text-xs text-ink/40 underline-offset-2 hover:underline"
            >
              archive
            </button>
          </li>
        ))}
        {habits.length === 0 ? (
          <li className="text-sm text-ink/60">
            No habits yet — add one small thing you want to keep.
          </li>
        ) : null}
      </ul>

      <form action={createHabit} className="flex gap-2">
        <input
          type="text"
          name="title"
          maxLength={120}
          placeholder="A small habit…"
          className="min-h-11 flex-1 rounded-lg border border-sand/60 px-3 text-sm focus-visible:outline-2 focus-visible:outline-depth"
        />
        <Button type="submit" variant="secondary" disabled={pending}>
          Add
        </Button>
      </form>
    </div>
  );
}
