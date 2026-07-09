import Anthropic from "@anthropic-ai/sdk";
import type { ChatOptions, LLMProvider, LLMResponse, Message } from "./types";

/**
 * Provider selection by env (LLM_PROVIDER). The `verbatim` provider streams
 * authored content unchanged — zero cost, zero network, fully deterministic.
 * It is the permanent fallback: the whole product works without an LLM, and
 * any Anthropic failure degrades to it with no user-facing error.
 *
 * SDK imports are confined to this directory (grep-verified in tests). The
 * `anthropic` provider only ever *rephrases* an authored line toward a tone —
 * it never selects nodes, options, or stages (PRD §6.2). That discipline
 * lives in the caller (lib/llm/prompts/juniper.ts + the route); this file is
 * a thin, provider-agnostic transport.
 */
const CHUNK_WORDS = 4;

/** Juniper lines are short; a tight budget keeps latency and cost down. */
const DEFAULT_MAX_TOKENS = 512;
/** A small, fast Claude model is the right default for tone rephrasing. */
const DEFAULT_MODEL = "claude-haiku-4-5";

/** Thrown on any Anthropic transport failure so callers can fall to verbatim. */
export class LLMProviderError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "LLMProviderError";
  }
}

export const verbatimProvider: LLMProvider = {
  async chat(messages: Message[]): Promise<LLMResponse> {
    return { text: lastContent(messages) };
  },
  async *stream(messages: Message[]): AsyncIterable<string> {
    const words = lastContent(messages).split(/(?<=\s)/);
    for (let i = 0; i < words.length; i += CHUNK_WORDS) {
      yield words.slice(i, i + CHUNK_WORDS).join("");
    }
  },
};

function lastContent(messages: Message[]): string {
  const last = messages.at(-1);
  if (!last) throw new Error("verbatim provider needs at least one message");
  return last.content;
}

/** Split our role-tagged messages into Anthropic's system + turn shape. */
function splitMessages(messages: Message[]): {
  system: string;
  turns: { role: "user" | "assistant"; content: string }[];
} {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const turns = messages
    .filter(
      (m): m is Message & { role: "user" | "assistant" } => m.role !== "system",
    )
    .map((m) => ({ role: m.role, content: m.content }));
  return { system, turns };
}

let cachedClient: Anthropic | null = null;
function anthropicClient(): Anthropic {
  if (!cachedClient) {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) throw new LLMProviderError("LLM_API_KEY is not set");
    cachedClient = new Anthropic({ apiKey });
  }
  return cachedClient;
}

function modelFor(options?: ChatOptions): string {
  return options?.model ?? process.env.LLM_MODEL ?? DEFAULT_MODEL;
}

export const anthropicProvider: LLMProvider = {
  async chat(messages, options): Promise<LLMResponse> {
    const { system, turns } = splitMessages(messages);
    try {
      const res = await anthropicClient().messages.create({
        model: modelFor(options),
        max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
        system: system || undefined,
        messages: turns,
      });
      const text = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      return { text };
    } catch (err) {
      if (err instanceof LLMProviderError) throw err;
      throw new LLMProviderError("Anthropic chat failed", { cause: err });
    }
  },
  async *stream(messages, options): AsyncIterable<string> {
    const { system, turns } = splitMessages(messages);
    let stream: ReturnType<Anthropic["messages"]["stream"]>;
    try {
      stream = anthropicClient().messages.stream({
        model: modelFor(options),
        max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
        system: system || undefined,
        messages: turns,
      });
    } catch (err) {
      if (err instanceof LLMProviderError) throw err;
      throw new LLMProviderError("Anthropic stream failed to start", {
        cause: err,
      });
    }
    try {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          yield event.delta.text;
        }
      }
    } catch (err) {
      throw new LLMProviderError("Anthropic stream failed mid-turn", {
        cause: err,
      });
    }
  },
};

export type ProviderName = "verbatim" | "anthropic";

export function getProvider(
  name: string | undefined = process.env.LLM_PROVIDER,
): LLMProvider {
  switch (name ?? "verbatim") {
    case "verbatim":
      return verbatimProvider;
    case "anthropic":
      // Without a key, degrade silently to verbatim — the product must never
      // crash on a missing/expired key (acceptance §1).
      return process.env.LLM_API_KEY ? anthropicProvider : verbatimProvider;
    case "openai":
      throw new Error(
        `LLM provider "openai" is not supported — the chosen provider is "anthropic". Use LLM_PROVIDER=anthropic or =verbatim.`,
      );
    default:
      throw new Error(`Unknown LLM_PROVIDER "${name}".`);
  }
}

/** Convenience: stream an authored text through the verbatim chunker. */
export function streamAuthored(text: string): AsyncIterable<string> {
  return verbatimProvider.stream([{ role: "assistant", content: text }]);
}
