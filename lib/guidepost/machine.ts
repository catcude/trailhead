import {
  RETURN_TARGET,
  type ContentNode,
  type PathContent,
  type PathId,
  type QuoteBank,
} from "@/content/schema";
import type { CheckinVariant } from "@/lib/utils/time";
import {
  EngineInputError,
  type EngineInput,
  type EngineOutput,
  type JuniperMessage,
  type SessionState,
} from "./types";

/**
 * The Guidepost stage state machine. Pure and deterministic: no LLM, no
 * network, no clock — content and variant come in as arguments. Only this
 * function moves the user between nodes; LLM output never does.
 */
export interface EngineContext {
  content: PathContent;
  quoteBanks: Partial<Record<PathId, QuoteBank>>;
}

function getNode(content: PathContent, id: string): ContentNode {
  const node = content.nodes[id];
  if (!node) throw new EngineInputError(`unknown node "${id}"`);
  return node;
}

function juniperLine(
  node: ContentNode,
  variant: CheckinVariant,
): JuniperMessage | null {
  if (!node.juniper) return null;
  const text =
    variant === "evening" && node.juniper.evening
      ? node.juniper.evening
      : node.juniper.text;
  return { nodeId: node.id, text, adaptable: node.juniper.adaptable };
}

/** Resolve a raw edge target, handling the @return sentinel. */
function resolveTarget(
  state: SessionState,
  target: string,
): {
  nodeId: string;
  returnTo?: string;
} {
  if (target === RETURN_TARGET) {
    if (!state.returnTo) {
      throw new EngineInputError("@return with no fallback origin");
    }
    return { nodeId: state.returnTo, returnTo: undefined };
  }
  return { nodeId: target, returnTo: state.returnTo };
}

/**
 * Present the node at `nodeId`: auto-advance through `message` nodes and
 * nodes that don't apply to the current variant, collecting Juniper's lines,
 * until an interactive node (or end) is reached.
 */
function present(
  ctx: EngineContext,
  state: SessionState,
  nodeId: string,
  leadIn: JuniperMessage[],
): EngineOutput {
  const messages = [...leadIn];
  let current = getNode(ctx.content, nodeId);
  let returnTo = state.returnTo;

  for (;;) {
    // Skip nodes that belong to the other variant.
    if (current.variantOnly && current.variantOnly !== state.variant) {
      if (!("next" in current)) {
        throw new EngineInputError(
          `variant-only node "${current.id}" has no next`,
        );
      }
      const resolved = resolveTarget({ ...state, returnTo }, current.next);
      returnTo = resolved.returnTo;
      current = getNode(ctx.content, resolved.nodeId);
      continue;
    }

    const line = juniperLine(current, state.variant);
    if (line) messages.push(line);

    if (current.kind === "message") {
      const resolved = resolveTarget({ ...state, returnTo }, current.next);
      returnTo = resolved.returnTo;
      current = getNode(ctx.content, resolved.nodeId);
      continue;
    }
    break;
  }

  const nextState: SessionState = {
    ...state,
    currentNodeId: current.id,
    returnTo,
    done: current.kind === "end",
  };

  const output: EngineOutput = {
    state: nextState,
    messages,
    freeText: current.kind === "freeText",
    stage: current.stage,
    toneTag: current.tone,
    tip: current.tip,
    fallbacks: current.fallbacks
      ? (Object.keys(current.fallbacks) as EngineOutput["fallbacks"])
      : undefined,
    done: nextState.done,
  };

  if (current.kind === "choice") {
    output.options = current.options.map(({ id, label }) => ({ id, label }));
  }
  if (current.kind === "tool") {
    output.tool = current.tool;
  }
  if (current.kind === "reflection") {
    const bank = ctx.quoteBanks[current.quoteBank];
    if (!bank)
      throw new EngineInputError(`missing quote bank "${current.quoteBank}"`);
    output.quotes = state.variant === "evening" ? bank.evening : bank.standard;
  }
  return output;
}

export function startSession(
  ctx: EngineContext,
  variant: CheckinVariant,
): EngineOutput {
  const state: SessionState = {
    path: ctx.content.path,
    variant,
    currentNodeId: ctx.content.entryNodeId,
    choices: {},
    done: false,
  };
  return present(ctx, state, ctx.content.entryNodeId, []);
}

export function advance(
  state: SessionState,
  input: EngineInput,
  ctx: EngineContext,
): EngineOutput {
  if (state.done) throw new EngineInputError("session already complete");
  if (input.type === "start") {
    return present(ctx, state, state.currentNodeId, []);
  }

  const node = getNode(ctx.content, state.currentNodeId);

  // Fallbacks are available on any node that declares them.
  if (input.type === "fallback") {
    const target = node.fallbacks?.[input.kind];
    if (!target) {
      throw new EngineInputError(
        `node "${node.id}" has no "${input.kind}" fallback`,
      );
    }
    const detourState: SessionState = { ...state, returnTo: node.id };
    return present(ctx, detourState, target, []);
  }

  const ack = node.response
    ? [
        {
          nodeId: node.id,
          text: node.response.text,
          adaptable: node.response.adaptable,
        },
      ]
    : [];

  switch (node.kind) {
    case "choice": {
      if (input.type !== "option") {
        throw new EngineInputError(`node "${node.id}" expects an option`);
      }
      const option = node.options.find((o) => o.id === input.optionId);
      if (!option) {
        throw new EngineInputError(
          `unknown option "${input.optionId}" on node "${node.id}"`,
        );
      }
      const chosen: SessionState = {
        ...state,
        choices: { ...state.choices, [node.id]: option.id },
      };
      const resolved = resolveTarget(chosen, option.target);
      return present(
        ctx,
        { ...chosen, returnTo: resolved.returnTo },
        resolved.nodeId,
        ack,
      );
    }
    case "freeText": {
      if (input.type !== "text") {
        throw new EngineInputError(`node "${node.id}" expects text`);
      }
      const resolved = resolveTarget(state, node.next);
      return present(
        ctx,
        { ...state, returnTo: resolved.returnTo },
        resolved.nodeId,
        ack,
      );
    }
    case "tool": {
      if (input.type !== "toolResult") {
        throw new EngineInputError(`node "${node.id}" expects a tool result`);
      }
      const resolved = resolveTarget(state, node.next);
      return present(
        ctx,
        { ...state, returnTo: resolved.returnTo },
        resolved.nodeId,
        ack,
      );
    }
    case "reflection": {
      if (input.type !== "option") {
        throw new EngineInputError(
          `node "${node.id}" expects a quote selection`,
        );
      }
      const chosen: SessionState = {
        ...state,
        choices: { ...state.choices, [node.id]: input.optionId },
      };
      const resolved = resolveTarget(chosen, node.next);
      return present(
        ctx,
        { ...chosen, returnTo: resolved.returnTo },
        resolved.nodeId,
        ack,
      );
    }
    case "message":
    case "end":
      throw new EngineInputError(`node "${node.id}" accepts no input`);
  }
}
