"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Covey Quadrant Sorter — basic M1 version (drag-free, one-thumb).
 * Add items, tap a quadrant for each. Polished visual matrix arrives in M2.
 * Quadrant names are the teen-friendly Covey framing from the path docs.
 */
const QUADRANTS = [
  { id: "urgent-important", label: "Urgent + Important" },
  { id: "not-urgent-important", label: "Important, Not Urgent" },
  { id: "urgent-not-important", label: "Urgent, Not Important" },
  { id: "not-urgent-not-important", label: "Neither" },
] as const;

type QuadrantId = (typeof QUADRANTS)[number]["id"];

export interface CoveySorterResult {
  items: { text: string; quadrant: QuadrantId }[];
}

export function CoveyQuadrantSorter({
  onDone,
  disabled,
}: {
  onDone: (result: CoveySorterResult) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [items, setItems] = useState<{ text: string; quadrant?: QuadrantId }[]>(
    [],
  );

  const unsorted = items.filter((i) => !i.quadrant);
  const allSorted = items.length > 0 && unsorted.length === 0;

  function addItem() {
    const text = draft.trim();
    if (!text) return;
    setItems((prev) => [...prev, { text }]);
    setDraft("");
  }

  function assign(index: number, quadrant: QuadrantId) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quadrant } : item)),
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-sand/40 bg-white p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder="Add a thing…"
          disabled={disabled}
          className="min-h-11 flex-1 rounded-lg border border-sand/60 px-3 text-sm focus-visible:outline-2 focus-visible:outline-depth"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={addItem}
          disabled={disabled || draft.trim().length === 0}
        >
          Add
        </Button>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item, index) => (
          <li key={index} className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{item.text}</span>
            <div className="flex flex-wrap gap-1.5">
              {QUADRANTS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => assign(index, q.id)}
                  className={`min-h-9 rounded-full border px-3 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-depth ${
                    item.quadrant === q.id
                      ? "border-cta bg-coral/20 font-semibold text-depth"
                      : "border-sand/60 text-ink"
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        onClick={() =>
          onDone({
            items: items.filter(
              (i): i is { text: string; quadrant: QuadrantId } =>
                Boolean(i.quadrant),
            ),
          })
        }
        disabled={disabled || !allSorted}
      >
        Done sorting
      </Button>
    </div>
  );
}
