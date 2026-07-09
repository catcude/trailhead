export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  /** Override the provider's default model id. */
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  text: string;
}

/**
 * Provider-agnostic interface (CLAUDE.md §LLM Abstraction). No LLM SDK may
 * be imported outside lib/llm/. All Juniper responses stream.
 */
export interface LLMProvider {
  chat(messages: Message[], options?: ChatOptions): Promise<LLMResponse>;
  stream(messages: Message[], options?: ChatOptions): AsyncIterable<string>;
}
