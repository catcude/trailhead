import { NextResponse, type NextRequest } from "next/server";
import { paths, quoteBanks } from "@/content";
import type { PathContent } from "@/content/schema";
import { getFlags } from "@/lib/flags";
import {
  CheckinBodySchema,
  FALLBACK_LABELS,
  type CheckinBody,
} from "@/lib/guidepost/api-schema";
import {
  advance,
  startSession,
  type EngineContext,
} from "@/lib/guidepost/machine";
import { routeEntry } from "@/lib/guidepost/router";
import { composeSafetyMessages } from "@/lib/guidepost/safety-messages";
import {
  EngineInputError,
  type EngineOutput,
  type SessionState,
} from "@/lib/guidepost/types";
import { screen, type CrisisCategory } from "@/lib/llm/safety";
import { classifyCrisis } from "@/lib/llm/safety-classifier";
import { getProvider, streamAuthored } from "@/lib/llm/provider";
import { adaptMessage } from "@/lib/llm/adapt";
import { interpretBrainDump } from "@/lib/llm/interpret";
import { explainPlanChange } from "@/lib/llm/plan-change";
import { recalibratedTone } from "@/content/tone/tones";
import { canStartCheckin } from "@/lib/billing/entitlement";

/**
 * Free-tier paywall copy (D2). Kind, honest, no dark pattern — names the free
 * Mini Resets. Draft (needsCat): exact wording pending Cat.
 */
const PAYWALL_COPY =
  "You’ve used today’s check-in. Come back tomorrow whenever you’re ready — or unlock unlimited check-ins any time. Mini Resets are always free.";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { createFixedWindowLimiter } from "@/lib/utils/rate-limit";
import { checkinVariantForHour } from "@/lib/utils/time";

/**
 * The Guidepost engine endpoint (scaffolding plan §3.3). Order is fixed:
 * auth → rate limit → parse → session → SAFETY SCREEN (free text, before
 * anything else) → advance (deterministic machine) → persist → stream.
 *
 * Response: SSE — `message` events open each Juniper line, `token` events
 * stream its text (verbatim provider in M1), one final `state` event
 * carries the structured frame { sessionId, nodeId, stage, options, tool,
 * quotes, tip, freeText, done }.
 */

const USER_LIMIT = { limit: 60, windowMs: 60_000 };
// Per-IP backstop, per serverless instance (Postgres RPC is the real limit).
const ipLimiter = createFixedWindowLimiter({ limit: 120, windowMs: 60_000 });

const GENTLE_429 =
  "You’re moving fast — give it a few seconds and try again. No rush here.";

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Check-ins aren’t available in this environment yet." },
      { status: 503 },
    );
  }

  // 1. Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // 2. Rate limits — per-IP backstop, then shared per-user window.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!ipLimiter.check(ip)) {
    return NextResponse.json({ error: GENTLE_429 }, { status: 429 });
  }
  const { data: allowed, error: rateError } = await supabase.rpc(
    "check_rate_limit",
    {
      p_key: `checkin:${user.id}`,
      p_limit: USER_LIMIT.limit,
      p_window_ms: USER_LIMIT.windowMs,
    },
  );
  if (rateError) {
    return NextResponse.json(
      { error: "rate limit unavailable" },
      { status: 500 },
    );
  }
  if (!allowed) {
    return NextResponse.json({ error: GENTLE_429 }, { status: 429 });
  }

  // 3. Parse
  let body: CheckinBody;
  try {
    body = CheckinBodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const flags = getFlags();
  const variant = checkinVariantForHour(body.clientLocalHour);

  try {
    // 4. Session — create via router, or load an existing one.
    let sessionId: string;
    let content: PathContent;
    let userMessage: string | null = null;

    if (body.input.type === "router") {
      const path = routeEntry(body.input.optionId, flags);
      if (!path) {
        return NextResponse.json({ error: "invalid request" }, { status: 400 });
      }
      const pathContent = paths[path];
      if (!pathContent) {
        return NextResponse.json({ error: "invalid request" }, { status: 400 });
      }
      // Freemium gate (WS7): a full check-in = a NEW session. Mini Resets run
      // inside an existing session, so they're never gated here. Subscribers
      // are unlimited; free users get FREE_DAILY_CHECKINS/day.
      if (!(await canStartCheckin(supabase, user.id))) {
        return NextResponse.json(
          { error: PAYWALL_COPY, paywall: true },
          { status: 402 },
        );
      }
      content = pathContent;
      const ctx: EngineContext = { content, quoteBanks };
      const output = startSession(ctx, variant);
      const inserted = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          path,
          variant,
          current_node: output.state.currentNodeId,
          state: output.state,
        })
        .select("id")
        .single();
      if (inserted.error) throw inserted.error;
      sessionId = inserted.data.id;
      await persistTurn(supabase, sessionId, null, output);
      return sse(output, sessionId);
    }

    if (!body.sessionId) {
      return NextResponse.json({ error: "invalid request" }, { status: 400 });
    }
    sessionId = body.sessionId;
    const loaded = await supabase
      .from("chat_sessions")
      .select("id, path, state")
      .eq("id", sessionId)
      .single();
    if (loaded.error || !loaded.data) {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }
    const pathContent = paths[loaded.data.path as keyof typeof paths];
    if (!pathContent) {
      return NextResponse.json({ error: "session not found" }, { status: 404 });
    }
    content = pathContent;
    const state = loaded.data.state as SessionState;
    const ctx: EngineContext = { content, quoteBanks };

    // 5. Safety screen — free text only, before ANYTHING else runs.
    if (body.input.type === "text") {
      const lexicon = screen(body.input.text);
      // The lexicon is the floor. The optional second-pass classifier may only
      // ADD an escalation it missed (WS4); it can never clear a lexicon hit.
      let crisisCategory: CrisisCategory | null = lexicon.ok
        ? null
        : lexicon.category;
      if (crisisCategory === null && flags.safetyClassifier) {
        crisisCategory = await classifyCrisis(getProvider(), body.input.text);
      }
      if (crisisCategory) {
        // Identifier-free telemetry (CLAUDE.md §Safety): category/path/stage
        // and nothing else — never the trigger text, user id, or session id.
        const stage = content.nodes[state.currentNodeId]?.stage ?? null;
        await supabase.rpc("log_safety_event", {
          p_category: crisisCategory,
          p_path: loaded.data.path,
          p_stage: stage,
        });
        const safetyMessages = composeSafetyMessages();
        const pausedState: SessionState = { ...state, done: true };
        await supabase
          .from("chat_sessions")
          .update({
            state: { ...pausedState, safetyPause: crisisCategory },
            ended_at: new Date().toISOString(),
          })
          .eq("id", sessionId);
        // Persist Juniper's safety lines for continuity; never the trigger
        // text, and no category on the message rows.
        await supabase.from("chat_messages").insert(
          safetyMessages.map((m) => ({
            session_id: sessionId,
            role: "juniper",
            content: m.text,
          })),
        );
        return sseSafety(safetyMessages, sessionId);
      }
      userMessage = body.input.text;
    } else if (body.input.type === "option") {
      const node = content.nodes[state.currentNodeId];
      const label =
        node?.kind === "choice"
          ? node.options.find(
              (o) => o.id === (body.input as { optionId: string }).optionId,
            )?.label
          : undefined;
      userMessage = label ?? body.input.optionId;
    } else if (body.input.type === "fallback") {
      userMessage = FALLBACK_LABELS[body.input.kind] ?? body.input.kind;
    } else if (body.input.type === "toolResult") {
      userMessage = JSON.stringify({ toolResult: body.input.payload ?? null });
    }

    // 6. Advance — only the deterministic machine moves the user.
    const preNode = content.nodes[state.currentNodeId];
    const output = advance(state, body.input, ctx);

    // 6a. Free-text interpretation (WS2): seed the Covey sorter with the
    // student's brain-dump items. The machine still owns flow — this only
    // fills the tool's props. Falls back to a deterministic split in verbatim
    // mode or on any LLM error (see interpretBrainDump).
    if (
      output.tool?.type === "coveyQuadrantSorter" &&
      body.input.type === "text"
    ) {
      const items = await interpretBrainDump(getProvider(), body.input.text);
      output.tool = {
        ...output.tool,
        props: { ...output.tool.props, items },
      };
    }

    // 6b. Grounded plan-change explanation (WS2): when a Green student asks to
    // walk through WHY the plan changed, prepend an explanation grounded ONLY
    // in their own session text. Skipped entirely in verbatim mode / on error
    // (explainPlanChange returns null), preserving M1 behavior. The authored
    // "Does that help?" line still follows verbatim.
    if (
      content.path === "green" &&
      preNode?.id === "s5-processing" &&
      body.input.type === "option" &&
      body.input.optionId === "yes-walk-through"
    ) {
      const userInputs = await loadSessionUserText(supabase, sessionId);
      const explanation = await explainPlanChange(getProvider(), userInputs);
      if (explanation) {
        output.messages.unshift({
          nodeId: "s5-processing-help:why",
          text: explanation,
          // Already generated and grounded — never re-adapted.
          adaptable: false,
        });
      }
    }

    // 7. Persist turn + node-specific side effects.
    await persistTurn(supabase, sessionId, userMessage, output, preNode?.stage);

    if (preNode?.kind === "reflection" && body.input.type === "option") {
      const bank = quoteBanks[preNode.quoteBank];
      const index = Number(body.input.optionId.replace("quote-", ""));
      const quotes =
        state.variant === "evening" ? bank?.evening : bank?.standard;
      const quoteText = quotes?.[index];
      if (quoteText) {
        await supabase.from("reflections").insert({
          user_id: user.id,
          session_id: sessionId,
          quote_text: quoteText,
          outcome_tag:
            state.choices["s6"] ?? state.choices["s5-checkin"] ?? null,
        });
      }
    }
    if (
      content.path === "yellow" &&
      preNode?.id === "s6-aha-text" &&
      body.input.type === "text"
    ) {
      await supabase.from("aha_moments").insert({
        user_id: user.id,
        text: body.input.text,
        source_session: sessionId,
      });
    }

    return sse(output, sessionId);
  } catch (error) {
    if (error instanceof EngineInputError) {
      return NextResponse.json({ error: "invalid request" }, { status: 400 });
    }
    throw error;
  }
}

/**
 * The student's own text from THIS session (role=user rows), for grounding
 * the plan-change explanation. Session-scoped by design — never joins to
 * profiles, email, or display name (PRD §6.3). Tool-result payloads are
 * excluded (not the student's words).
 */
async function loadSessionUserText(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("content, created_at")
    .eq("session_id", sessionId)
    .eq("role", "user")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data
    .map((row) => (row as { content: string }).content)
    .filter((c) => typeof c === "string" && !c.startsWith('{"toolResult"'));
}

async function persistTurn(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  userMessage: string | null,
  output: EngineOutput,
  userStage?: number,
) {
  const rows: {
    session_id: string;
    role: string;
    content: string;
    stage?: number;
  }[] = [];
  if (userMessage !== null) {
    rows.push({
      session_id: sessionId,
      role: "user",
      content: userMessage,
      stage: userStage,
    });
  }
  for (const message of output.messages) {
    rows.push({
      session_id: sessionId,
      role: "juniper",
      content: message.text,
      stage: output.stage,
    });
  }
  if (rows.length > 0) {
    const { error } = await supabase.from("chat_messages").insert(rows);
    if (error) throw error;
  }
  const { error } = await supabase
    .from("chat_sessions")
    .update({
      current_node: output.state.currentNodeId,
      state: output.state,
      ended_at: output.done ? new Date().toISOString() : null,
    })
    .eq("id", sessionId);
  if (error) throw error;
}

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
}

function sse(output: EngineOutput, sessionId: string): Response {
  const provider = getProvider();
  // Stage-5 recalibration (PRD §3.3) overrides the node's own tone for the
  // rest of the session; falls back to the node tone before any Stage-5 pick.
  const tone = recalibratedTone(output.state.choices) ?? output.toneTag;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      for (const message of output.messages) {
        send("message", { nodeId: message.nodeId });
        // `adaptMessage` rephrases only `adaptable` lines under a real
        // provider and falls back to authored text on any LLM error. Safety,
        // reflection quotes, and acknowledgments marked `adaptable: false`
        // are byte-identical (PRD §6.2). The resolved line is then chunked by
        // the verbatim streamer so the SSE `token` framing is uniform.
        const text = await adaptMessage(provider, message, tone);
        for await (const chunk of streamAuthored(text)) {
          send("token", { text: chunk });
        }
      }
      send("state", {
        sessionId,
        nodeId: output.state.currentNodeId,
        stage: output.stage,
        toneTag: output.toneTag,
        options: output.options ?? null,
        tool: output.tool ?? null,
        quotes: output.quotes ?? null,
        tip: output.tip ?? null,
        fallbacks: output.fallbacks ?? null,
        freeText: output.freeText,
        done: output.done,
      });
      controller.close();
    },
  });
  return new Response(stream, { headers: sseHeaders() });
}

function sseSafety(
  messages: { nodeId: string; text: string }[],
  sessionId: string,
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      // Safety content is never streamed through the LLM layer and never
      // token-chunked — it arrives whole, immediately.
      for (const message of messages) {
        send("message", { nodeId: message.nodeId });
        send("token", { text: message.text });
      }
      send("state", {
        sessionId,
        nodeId: "safety",
        stage: 0,
        toneTag: "steady",
        options: null,
        tool: null,
        quotes: null,
        tip: null,
        freeText: false,
        done: true,
        safety: true,
      });
      controller.close();
    },
  });
  return new Response(stream, { headers: sseHeaders() });
}
