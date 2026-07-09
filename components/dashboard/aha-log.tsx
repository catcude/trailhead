"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { AhaTracker } from "@/components/tools/aha-tracker";
import { addAha } from "@/app/(app)/dashboard/actions";

export interface AhaView {
  id: string;
  text: string;
  tag: string | null;
  createdAt: string;
}

/**
 * Aha! log (WS6) — the standalone dashboard view of insights, plus a capture
 * via the shared AhaTracker component.
 */
export function AhaLog({ ahas }: { ahas: AhaView[] }) {
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {ahas.map((a) => (
          <li
            key={a.id}
            className="rounded-lg border border-sand/50 bg-white px-3 py-2"
          >
            <p className="text-sm">{a.text}</p>
            {a.tag ? (
              <span className="mt-1 inline-block rounded-full bg-calm/20 px-2 py-0.5 text-xs text-depth">
                {a.tag}
              </span>
            ) : null}
          </li>
        ))}
        {ahas.length === 0 ? (
          <li className="text-sm text-ink/60">
            Nothing logged yet — insights you catch will land here.
          </li>
        ) : null}
      </ul>

      {adding ? (
        <AhaTracker
          disabled={pending}
          onDone={(result) => {
            start(async () => {
              await addAha(result.text, result.tag);
              setAdding(false);
            });
          }}
        />
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setAdding(true)}
        >
          Log an Aha! moment
        </Button>
      )}
    </div>
  );
}
