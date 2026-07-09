"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Aha! Moment Tracker — capture an insight (short text) with an optional tag.
 * Built fully (flow authored in Yellow S6). Reused in-dialogue and on the
 * dashboard (WS6). Structured UI, one-thumb, no timers.
 */
export interface AhaResult {
  text: string;
  tag: string | null;
}

export function AhaTracker({
  onDone,
  disabled,
  submitLabel = "Save this",
}: {
  onDone: (result: AhaResult) => void;
  disabled?: boolean;
  submitLabel?: string;
}) {
  const [text, setText] = useState("");
  const [tag, setTag] = useState("");

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-sand/40 bg-white p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What clicked for you?"
        rows={3}
        disabled={disabled}
        className="w-full rounded-lg border border-sand/60 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-depth"
      />
      <input
        type="text"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="Add a tag (optional)"
        disabled={disabled}
        className="min-h-11 w-full rounded-lg border border-sand/60 px-3 text-sm focus-visible:outline-2 focus-visible:outline-depth"
      />
      <Button
        type="button"
        onClick={() => onDone({ text: text.trim(), tag: tag.trim() || null })}
        disabled={disabled || text.trim().length === 0}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
