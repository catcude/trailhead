"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FALLBACK_LABELS,
  type CheckinStateFrame,
} from "@/lib/guidepost/api-schema";
import { Button } from "@/components/ui/button";
import { TipBox } from "@/components/ui/tip-box";
import {
  CoveyQuadrantSorter,
  type CoveySorterResult,
} from "@/components/tools/covey-quadrant-sorter";
import { MiniResetToolkit } from "@/components/tools/mini-reset-toolkit";
import { StartSmallPlanner } from "@/components/tools/start-small-planner";
import { MicroNeedsMenu } from "@/components/tools/micro-needs-menu";
import { GentleFocusAnchor } from "@/components/tools/gentle-focus-anchor";
import { MoodMatchingVisual } from "@/components/tools/mood-matching-visual";
import { EveningWindDown } from "@/components/tools/evening-wind-down";
import { AhaTracker } from "@/components/tools/aha-tracker";

interface Bubble {
  role: "juniper" | "user";
  text: string;
}

interface RouterOptionProp {
  id: string;
  label: string;
}

/**
 * The Guidepost check-in conversation. Renders the entry router, then
 * drives /api/checkin turn by turn, streaming Juniper's lines (SSE) and
 * rendering the structured frame: options, free text, tools, quotes.
 * No timers, no time pressure — ever.
 */
export function CheckinClient({
  routerPrompt,
  routerOptions,
  resumeSessionId = null,
}: {
  routerPrompt: string;
  routerOptions: RouterOptionProp[];
  /** Most recent unfinished session, if any — offers a resume (WS8). */
  resumeSessionId?: string | null;
}) {
  const [bubbles, setBubbles] = useState<Bubble[]>([
    { role: "juniper", text: routerPrompt },
  ]);
  const [frame, setFrame] = useState<CheckinStateFrame | null>(null);
  const [atRouter, setAtRouter] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [horizon, setHorizon] = useState<string[] | null>(null);
  const [resumeOffer, setResumeOffer] = useState<boolean>(
    Boolean(resumeSessionId),
  );
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [bubbles, frame, pending]);

  async function send(
    input: Record<string, unknown>,
    userBubble: string | null,
    sessionIdOverride?: string,
  ) {
    setPending(true);
    setError(null);
    if (userBubble !== null) {
      setBubbles((prev) => [...prev, { role: "user", text: userBubble }]);
    }

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdOverride ?? frame?.sessionId,
          input,
          clientLocalHour: new Date().getHours(),
        }),
      });

      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(
          payload?.error ?? "Something hiccuped on our side. Try again?",
        );
        setPending(false);
        return;
      }

      setAtRouter(false);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentText: string | null = null;

      const flushMessage = () => {
        if (currentText !== null) {
          const text = currentText;
          setBubbles((prev) => [...prev, { role: "juniper", text }]);
        }
        currentText = null;
      };

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";
        for (const block of blocks) {
          const eventMatch = block.match(/^event: (.*)$/m);
          const dataMatch = block.match(/^data: (.*)$/m);
          if (!eventMatch || !dataMatch) continue;
          const data = JSON.parse(dataMatch[1]) as Record<string, unknown>;
          switch (eventMatch[1]) {
            case "message":
              flushMessage();
              currentText = "";
              break;
            case "token":
              currentText = (currentText ?? "") + (data.text as string);
              break;
            case "state":
              flushMessage();
              setFrame(data as unknown as CheckinStateFrame);
              break;
          }
        }
      }
      flushMessage();
    } catch {
      setError("Lost the connection for a second. Try again?");
    }
    setPending(false);
  }

  const showOptions = !pending && !error;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-4 pb-8">
      {/* Stage dots — orientation only, never a timer. */}
      {frame && !frame.safety ? (
        <div
          className="flex justify-center gap-1.5"
          aria-label={`Stage ${frame.stage} of 6`}
        >
          {[1, 2, 3, 4, 5, 6].map((stage) => (
            <span
              key={stage}
              className={`h-1.5 w-6 rounded-full ${
                stage <= frame.stage ? "bg-cta" : "bg-sand/40"
              }`}
            />
          ))}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3">
        {bubbles.map((bubble, i) =>
          bubble.role === "juniper" ? (
            <div
              key={i}
              className="max-w-[85%] self-start rounded-[var(--radius-card)] rounded-bl-md border border-sand/40 bg-white p-4 shadow-[var(--shadow-card)]"
            >
              <p className="text-sm whitespace-pre-line">{bubble.text}</p>
            </div>
          ) : (
            <div
              key={i}
              className="max-w-[85%] self-end rounded-[var(--radius-card)] rounded-br-md bg-calm/15 p-4"
            >
              <p className="text-sm whitespace-pre-line">{bubble.text}</p>
            </div>
          ),
        )}
        {pending ? (
          <p className="text-sm text-ink/50" role="status">
            …
          </p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {error ? (
        <div className="flex flex-col gap-2">
          <p role="alert" className="text-sm text-depth">
            {error}
          </p>
          <Button variant="secondary" onClick={() => setError(null)}>
            Okay
          </Button>
        </div>
      ) : null}

      {frame?.tip && (frame.tip.title || frame.tip.body) ? (
        <TipBox title={frame.tip.title}>{frame.tip.body ?? null}</TipBox>
      ) : null}

      {/* ── Interactive area ─────────────────────────────────────────────── */}
      {resumeOffer && atRouter && resumeSessionId ? (
        <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-sand/40 bg-calm/10 p-4">
          <p className="text-sm text-depth">
            You have a check-in you didn’t finish. Want to pick up where you
            left off?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={pending}
              onClick={() => {
                setResumeOffer(false);
                void send({ type: "start" }, null, resumeSessionId);
              }}
            >
              Pick up where you left off
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => {
                setResumeOffer(false);
                void fetch("/api/checkin/close", { method: "POST" });
              }}
            >
              Start fresh
            </Button>
          </div>
        </div>
      ) : null}

      {showOptions && atRouter && !resumeOffer ? (
        <div className="flex flex-col gap-2">
          {routerOptions.map((option) => (
            <OptionButton
              key={option.id}
              label={option.label}
              onClick={() =>
                send({ type: "router", optionId: option.id }, option.label)
              }
            />
          ))}
        </div>
      ) : null}

      {showOptions && frame && !frame.done ? (
        <div className="flex flex-col gap-2">
          {frame.options?.map((option) => (
            <OptionButton
              key={option.id}
              label={option.label}
              onClick={() =>
                send({ type: "option", optionId: option.id }, option.label)
              }
            />
          ))}

          {frame.quotes?.map((quote, index) => (
            <OptionButton
              key={index}
              label={quote}
              onClick={() =>
                send({ type: "option", optionId: `quote-${index}` }, quote)
              }
            />
          ))}

          {frame.tool?.type === "coveyQuadrantSorter" ? (
            <CoveyQuadrantSorter
              disabled={pending}
              items={
                Array.isArray(frame.tool.props?.items)
                  ? (frame.tool.props.items as string[])
                  : undefined
              }
              onDone={(result: CoveySorterResult) =>
                send({ type: "toolResult", payload: result }, "Sorted ✓")
              }
            />
          ) : null}

          {frame.tool?.type === "miniResetToolkit" ? (
            <MiniResetToolkit
              toolkit={
                (frame.tool.props?.toolkit as "green" | "yellow") ?? "green"
              }
              disabled={pending}
              onDone={(result) =>
                send(
                  { type: "toolResult", payload: result },
                  result.tried ?? "Took a breather",
                )
              }
            />
          ) : null}

          {frame.tool?.type === "startSmallPlanner" ? (
            <StartSmallPlanner
              disabled={pending}
              onDone={(result) =>
                send({ type: "toolResult", payload: result }, "Planned ✓")
              }
            />
          ) : null}

          {frame.tool?.type === "microNeedsMenu" ? (
            <MicroNeedsMenu
              disabled={pending}
              onDone={(result) =>
                send(
                  { type: "toolResult", payload: result },
                  result.need ?? "I’m okay for now",
                )
              }
            />
          ) : null}

          {frame.tool?.type === "gentleFocusAnchor" ? (
            <GentleFocusAnchor
              disabled={pending}
              onDone={(result) =>
                send({ type: "toolResult", payload: result }, "Back")
              }
            />
          ) : null}

          {frame.tool?.type === "moodMatchingVisual" ? (
            <MoodMatchingVisual
              disabled={pending}
              onDone={(result) =>
                send(
                  { type: "toolResult", payload: result },
                  result.mood ?? "Continued",
                )
              }
            />
          ) : null}

          {frame.tool?.type === "eveningWindDown" ? (
            <EveningWindDown
              disabled={pending}
              onDone={(result) =>
                send(
                  { type: "toolResult", payload: result },
                  result.choice ?? "Wound down",
                )
              }
            />
          ) : null}

          {frame.tool?.type === "ahaTracker" ? (
            <AhaTracker
              disabled={pending}
              onDone={(result) =>
                send({ type: "toolResult", payload: result }, "Saved ✓")
              }
            />
          ) : null}

          {frame.freeText ? (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const text = draft.trim();
                if (!text) return;
                setDraft("");
                void send({ type: "text", text }, text);
              }}
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type it out…"
                maxLength={4000}
                className="min-h-11 flex-1 rounded-lg border border-sand/60 px-3 text-sm focus-visible:outline-2 focus-visible:outline-depth"
              />
              <Button type="submit" disabled={draft.trim().length === 0}>
                Send
              </Button>
            </form>
          ) : null}

          {frame.fallbacks && frame.fallbacks.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {frame.fallbacks.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() =>
                    send({ type: "fallback", kind }, FALLBACK_LABELS[kind])
                  }
                  className="min-h-9 rounded-full border border-sand/60 px-3 text-xs text-ink/70 transition-colors hover:border-calm hover:text-depth focus-visible:outline-2 focus-visible:outline-depth"
                >
                  {FALLBACK_LABELS[kind]}
                </button>
              ))}
              {frame.fallbacks.includes("stillStuck") ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/weekly-horizon");
                      if (!res.ok) return;
                      const data = (await res.json()) as {
                        intentions?: string[];
                      };
                      setHorizon(data.intentions ?? []);
                    } catch {
                      // Non-blocking convenience; ignore fetch errors.
                    }
                  }}
                  className="min-h-9 rounded-full border border-sand/60 px-3 text-xs text-ink/70 transition-colors hover:border-calm hover:text-depth focus-visible:outline-2 focus-visible:outline-depth"
                >
                  Show me my Weekly Horizon
                </button>
              ) : null}
            </div>
          ) : null}

          {horizon ? (
            <div className="mt-1 rounded-lg border border-sand/50 bg-calm/10 p-3">
              {horizon.length > 0 ? (
                <ul className="flex flex-col gap-1 text-sm text-depth">
                  {horizon.map((intention, i) => (
                    <li key={i}>• {intention}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink/70">
                  You haven’t set a Weekly Horizon yet — you can add one from
                  your dashboard.
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {frame?.done ? (
        <div className="flex flex-col items-center gap-3 pt-2">
          {frame.safety ? null : (
            <p className="text-sm text-ink/70">
              That’s a wrap for this check-in.
            </p>
          )}
          <Link href="/dashboard" className="text-sm font-medium text-info">
            Back to your dashboard
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function OptionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-[var(--radius-card)] border border-sand/60 bg-white px-4 py-2.5 text-left text-sm transition-colors hover:border-cta hover:bg-coral/10 focus-visible:outline-2 focus-visible:outline-depth"
    >
      {label}
    </button>
  );
}
