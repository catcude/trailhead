import { z } from "zod";
import { LLMProviderError, verbatimProvider } from "./provider";
import type { LLMProvider } from "./types";

/**
 * Free-text interpretation for the Yellow 2C brain dump (PRD §6.2: "the LLM
 * handles free-text user input"). The model splits a stream-of-consciousness
 * dump into discrete items to seed the Covey Quadrant Sorter. It does not
 * invent, merge, or advise — it only segments the student's own words.
 *
 * In verbatim mode, or on any failure, we fall back to a deterministic
 * newline/comma split. Interpretation never blocks the check-in.
 */

const MAX_ITEMS = 12;
const ItemsSchema = z.object({ items: z.array(z.string().min(1)) });

const SYSTEM = `You segment a student's free-text "brain dump" into discrete items to sort later. Return ONLY a JSON object of the form {"items": ["...", "..."]}.

Rules:
- Each item is one task or worry, in the student's own words, lightly cleaned.
- Do NOT invent items, do NOT add advice, do NOT merge distinct items.
- Preserve the student's meaning. Output nothing but the JSON object.`;

/** Deterministic fallback: split on newlines, commas, semicolons, bullets. */
export function splitItems(text: string): string[] {
  return text
    .split(/[\n,;•]+|(?:\s-\s)/)
    .map((s) => s.replace(/^[\s\-*•]+/, "").trim())
    .filter((s) => s.length > 0)
    .slice(0, MAX_ITEMS);
}

/** Pull the first {...} object out of a model reply that may carry preamble. */
function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return start >= 0 && end > start ? text.slice(start, end + 1) : text;
}

export async function interpretBrainDump(
  provider: LLMProvider,
  text: string,
): Promise<string[]> {
  if (provider === verbatimProvider) return splitItems(text);
  try {
    const res = await provider.chat(
      [
        { role: "system", content: SYSTEM },
        { role: "user", content: text },
      ],
      { maxTokens: 512 },
    );
    const parsed = ItemsSchema.safeParse(
      JSON.parse(extractJsonObject(res.text)),
    );
    if (!parsed.success) return splitItems(text);
    const items = parsed.data.items
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_ITEMS);
    return items.length > 0 ? items : splitItems(text);
  } catch (error) {
    // LLM transport, malformed JSON, or anything else — degrade, never crash.
    if (
      error instanceof LLMProviderError ||
      error instanceof SyntaxError ||
      error instanceof Error
    ) {
      return splitItems(text);
    }
    throw error;
  }
}
