"use client";

import { useState } from "react";
import { miniResetToolkits } from "@/content/tools/mini-reset";
import { Button } from "@/components/ui/button";

/**
 * Mini Reset Toolkit — Cat's authored reset actions, rendered as structured
 * UI (never a text blob). The user tries one (or just breathes), then the
 * verbatim re-entry line brings them back to where they detoured.
 */
export function MiniResetToolkit({
  toolkit,
  onDone,
  disabled,
}: {
  toolkit: "green" | "yellow";
  onDone: (result: { tried: string | null }) => void;
  disabled?: boolean;
}) {
  const kit = miniResetToolkits[toolkit];
  const [tried, setTried] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-sand/40 bg-calm/10 p-4">
      {kit.sections.map((section) => (
        <div key={section.heading}>
          {kit.sections.length > 1 ? (
            <p className="mb-2 text-sm font-semibold text-depth">
              {section.heading}
            </p>
          ) : null}
          <ul className="flex flex-col gap-1.5">
            {section.actions.map((action) => (
              <li key={action}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setTried(action)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-depth ${
                    tried === action
                      ? "border-cta bg-coral/20 text-depth"
                      : "border-sand/50 bg-white text-ink"
                  }`}
                >
                  {action}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <p className="text-sm text-depth">{kit.reentry}</p>
        <Button
          type="button"
          onClick={() => onDone({ tried })}
          disabled={disabled}
        >
          I’m ready
        </Button>
      </div>
    </div>
  );
}
