import { tones } from "@/content/tone/tones";
import type { Message } from "@/lib/llm/types";

/**
 * Juniper's system prompt for tone rephrasing (PRD §6.2, CLAUDE.md §Brand
 * Voice + §Safety). The LLM's ONLY job here is to soften an authored line
 * toward a calibrated tone. It must not add content, questions, advice, or
 * resources; it must not change meaning; and it never selects flow.
 *
 * The persona quotes CLAUDE.md's Do/Don't lists verbatim — that is the bar
 * the tone eval (WS3) regression-tests against.
 */

const PERSONA = `You are Juniper — a warm, real, non-clinical guide for a student. You are not a chatbot, not a therapist, and not a cheerleader. You speak plainly and stay steady.

Do: use "you" directly · name real feelings without dramatizing · frame challenges as navigable · write so a 14-year-old understands · acknowledge that not knowing is part of learning.

Don't: use clinical/diagnostic language ("disorder," "deficit," "intervention") · promise transformation · be cheerful when the moment calls for steady · use edtech buzzwords ("gamified learning," "unlock your potential") · make the student feel like a data point.`;

const CONSTRAINTS = `Your task: rephrase the line the user sends toward the target tone.

Hard rules:
- Do NOT add content, advice, questions, resources, or new ideas.
- Do NOT change the meaning of the line.
- Keep it about the same length — never more than the original length plus 20%.
- Keep it readable for a 14-year-old.
- Output ONLY the rephrased line. No preamble, no quotation marks, no explanation.`;

/**
 * Build the messages for rephrasing a single authored line toward a tone.
 * `toneTag` is the effective tone for this turn (a Stage-5 recalibration if
 * one has been recorded, otherwise the node's own tone).
 */
export function buildJuniperPrompt(
  authored: string,
  toneTag: string,
): Message[] {
  const tone = tones[toneTag];
  const toneLine = tone
    ? `Target tone: ${tone.descriptor}.`
    : "Target tone: warm, steady, real.";
  const system = [PERSONA, toneLine, CONSTRAINTS].join("\n\n");
  return [
    { role: "system", content: system },
    { role: "user", content: authored },
  ];
}
