import { buildJuniperPrompt } from "./prompts/juniper";
import { LLMProviderError, verbatimProvider } from "./provider";
import type { LLMProvider } from "./types";

/**
 * Resolve the text to stream for one Juniper message.
 *
 * The LLM's tone-adapted rephrasing is used only when the message is
 * `adaptable` AND a real provider is active; otherwise the authored text is
 * returned byte-identical. Any provider failure (missing key, network, rate
 * limit) falls back to the authored text — the product never surfaces an LLM
 * error to the student (PRD §6.2, acceptance §1). The call is buffered here
 * so the route can chunk a complete line and a mid-turn failure never yields
 * partial-then-duplicate output.
 *
 * Non-provider errors are re-thrown — a bug in prompt assembly should surface,
 * not silently degrade.
 */
export async function adaptMessage(
  provider: LLMProvider,
  message: { text: string; adaptable: boolean },
  tone: string,
): Promise<string> {
  if (provider === verbatimProvider || !message.adaptable) return message.text;
  try {
    const res = await provider.chat(buildJuniperPrompt(message.text, tone));
    return res.text || message.text;
  } catch (error) {
    if (!(error instanceof LLMProviderError)) throw error;
    return message.text;
  }
}
