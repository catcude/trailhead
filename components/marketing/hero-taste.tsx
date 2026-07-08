"use client";

import { useState } from "react";
import Link from "next/link";
import { paths, quoteBanks } from "@/content";
import { routerOptions, routerPrompt } from "@/content/router";
import { routeEntry } from "@/lib/guidepost/router";
import {
  advance,
  startSession,
  type EngineContext,
} from "@/lib/guidepost/machine";
import type { SessionState } from "@/lib/guidepost/types";
import type { Flags } from "@/lib/flags";

/**
 * Interactive reflective hero (PRD §5): "the visitor immediately sees their
 * reflection." A small, sandboxed taste of the Guidepost check-in — the real
 * state machine over the authored content, entirely client-side. NO auth, NO
 * DB writes, NO LLM. Option taps only; if the flow reaches a free-text node,
 * we invite sign-up rather than process text. Verbatim authored lines only
 * (the exact hero script is gap G-L1 — pending Cat).
 */

// Only Green/Yellow are offered here; the flag-gated paths never appear.
const HERO_FLAGS: Flags = {
  bluePath: false,
  redPath: false,
  dashboardExtras: false,
  quizScoring: false,
  safetyClassifier: false,
};
const HERO_OPTIONS = routerOptions.filter((o) => !o.flag);
const MAX_BEATS = 2;

interface Line {
  role: "juniper" | "you";
  text: string;
}

export function HeroTaste() {
  const [lines, setLines] = useState<Line[]>([
    { role: "juniper", text: routerPrompt.text },
  ]);
  const [options, setOptions] = useState<{ id: string; label: string }[]>(
    HERO_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
  );
  const [state, setState] = useState<SessionState | null>(null);
  const [beats, setBeats] = useState(0);
  const [invite, setInvite] = useState(false);

  function pick(id: string, label: string) {
    const you: Line = { role: "you", text: label };

    // First pick: the router routes to a path and starts the taste.
    if (!state) {
      const path = routeEntry(id, HERO_FLAGS);
      const content = path ? paths[path] : undefined;
      if (!content) return;
      const ctx: EngineContext = { content, quoteBanks };
      applyOutput(you, startSession(ctx, "standard"));
      return;
    }

    // Subsequent pick: advance the machine one beat.
    const content = paths[state.path];
    if (!content) return;
    const ctx: EngineContext = { content, quoteBanks };
    applyOutput(you, advance(state, { type: "option", optionId: id }, ctx));
  }

  function applyOutput(you: Line, out: ReturnType<typeof advance>) {
    const juniper: Line[] = out.messages.map((m) => ({
      role: "juniper" as const,
      text: m.text,
    }));
    setLines((prev) => [...prev, you, ...juniper]);
    setState(out.state);
    const nextBeats = beats + 1;
    setBeats(nextBeats);

    // A taste, not the whole check-in: stop at a free-text node, when a beat
    // offers no options, or once we've shown a couple of beats.
    if (out.freeText || !out.options || nextBeats >= MAX_BEATS) {
      setOptions([]);
      setInvite(true);
    } else {
      setOptions(out.options);
    }
  }

  return (
    <div
      data-testid="hero-taste"
      className="flex w-full max-w-md flex-col gap-3 rounded-[var(--radius-card)] border border-sand/40 bg-white/80 p-4 shadow-sm backdrop-blur"
    >
      <div className="flex flex-col gap-2" aria-live="polite">
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.role === "you"
                ? "self-end rounded-2xl rounded-br-md bg-calm/15 px-3 py-2 text-sm text-depth"
                : "self-start rounded-2xl rounded-bl-md bg-coral/10 px-3 py-2 text-sm"
            }
          >
            {line.role === "juniper" ? (
              <span className="mb-0.5 block text-xs font-semibold text-info">
                Juniper
              </span>
            ) : null}
            {line.text}
          </div>
        ))}
      </div>

      {options.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => pick(o.id, o.label)}
              className="min-h-11 rounded-full border border-sand/60 px-4 py-2 text-left text-sm transition-colors hover:border-cta hover:text-depth focus-visible:outline-2 focus-visible:outline-depth"
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : null}

      {invite ? (
        <div className="flex flex-col items-start gap-2 border-t border-sand/40 pt-3">
          <p className="text-sm text-ink/80">
            This is where a real check-in keeps going — at your pace.
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-cta px-6 py-2.5 text-lg font-semibold text-white transition-colors hover:bg-cta/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-depth"
          >
            Keep going
          </Link>
          <span className="text-xs text-ink/60">No tricks, no pressure.</span>
        </div>
      ) : null}
    </div>
  );
}
