"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Start Small Planner — break one big task into light, under-2-minute first
 * steps. The tool's Juniper framing is spoken by the node before this renders;
 * interior guidance copy is a gap (G-T1). This is the structured capture:
 * a task plus a few small steps, one-thumb, no timers.
 */
export interface StartSmallResult {
  task: string;
  steps: string[];
}

export function StartSmallPlanner({
  onDone,
  disabled,
}: {
  onDone: (result: StartSmallResult) => void;
  disabled?: boolean;
}) {
  const [task, setTask] = useState("");
  const [draft, setDraft] = useState("");
  const [steps, setSteps] = useState<string[]>([]);

  function addStep() {
    const s = draft.trim();
    if (!s) return;
    setSteps((prev) => [...prev, s]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-sand/40 bg-white p-4">
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="The big thing…"
        disabled={disabled}
        className="min-h-11 w-full rounded-lg border border-sand/60 px-3 text-sm focus-visible:outline-2 focus-visible:outline-depth"
      />

      <ul className="flex flex-col gap-1.5">
        {steps.map((step, i) => (
          <li
            key={i}
            className="rounded-lg border border-sand/50 bg-calm/10 px-3 py-2 text-sm"
          >
            {step}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addStep();
            }
          }}
          placeholder="One small step…"
          disabled={disabled}
          className="min-h-11 flex-1 rounded-lg border border-sand/60 px-3 text-sm focus-visible:outline-2 focus-visible:outline-depth"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={addStep}
          disabled={disabled || draft.trim().length === 0}
        >
          Add
        </Button>
      </div>

      <Button
        type="button"
        onClick={() => onDone({ task: task.trim(), steps })}
        disabled={disabled || steps.length === 0}
      >
        Start here
      </Button>
    </div>
  );
}
