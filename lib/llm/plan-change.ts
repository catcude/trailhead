import { LLMProviderError, verbatimProvider } from "./provider";
import type { LLMProvider, Message } from "./types";

/**
 * Green Stage-5 "walk me through WHY the plan changed" (PRD §3.3 processing
 * row: "explain the why"). When the student asks, Juniper explains the plan
 * changes grounded ONLY in what the student typed earlier this session — no
 * invented details, no advice. The authored "Does that help?" line still
 * closes the beat verbatim; this only adds the grounded explanation ahead of
 * it, and only when a real provider is active.
 *
 * Privacy (PRD §6.3, scaffolding plan §5): the prompt is built from
 * session-scoped student text ONLY. Never pass profile rows, email, or
 * display name here — the pure builder makes that auditable.
 */

const SYSTEM = `You are Juniper. A student wants to understand why their plan for today shifted as you worked together. Using ONLY the student's own words provided below, reflect back — in a warm, validating, reflective tone — how their priorities and constraints shaped the plan.

Hard rules:
- Use ONLY the details the student gave. Invent nothing (no dates, tasks, feelings, or people they did not mention).
- No advice, no new suggestions, no questions.
- 2–4 short sentences. Write so a 14-year-old understands.
- If the provided notes are too sparse to explain anything, output exactly: (none)`;

/** Pure, testable prompt builder — receives ONLY session-scoped student text. */
export function buildPlanChangePrompt(userInputs: string[]): Message[] {
  const notes = userInputs
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `- ${t}`)
    .join("\n");
  return [
    { role: "system", content: SYSTEM },
    {
      role: "user",
      content: `The student's own notes from today:\n${notes}`,
    },
  ];
}

/**
 * Returns the grounded explanation, or null when it should be skipped
 * (verbatim mode, no usable notes, model declines with "(none)", or any
 * provider error). A null result preserves the M1 behavior exactly.
 */
export async function explainPlanChange(
  provider: LLMProvider,
  userInputs: string[],
): Promise<string | null> {
  if (provider === verbatimProvider) return null;
  const notes = userInputs.map((t) => t.trim()).filter(Boolean);
  if (notes.length === 0) return null;
  try {
    const res = await provider.chat(buildPlanChangePrompt(notes), {
      maxTokens: 400,
    });
    const text = res.text.trim();
    if (!text || text === "(none)") return null;
    return text;
  } catch (error) {
    if (error instanceof LLMProviderError) return null;
    throw error;
  }
}
