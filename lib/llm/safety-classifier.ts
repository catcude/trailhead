import type { CrisisCategory } from "./safety";
import { verbatimProvider } from "./provider";
import type { LLMProvider } from "./types";

/**
 * Optional second-pass crisis classifier (WS4). The deterministic lexicon in
 * lib/llm/safety.ts is the FLOOR and always runs first; this may only ADD an
 * escalation the lexicon missed — it can never clear a lexicon hit. It runs
 * only when the lexicon PASSED, a real provider is active, and the operator
 * has opted in via SAFETY_CLASSIFIER=true (default off until reviewed).
 *
 * It is timeout-bounded and fail-open: on timeout, error, or an unparseable
 * reply it returns null, and the flow proceeds exactly as lexicon-passed. It
 * never blocks a check-in on the model being slow or down.
 */

const TIMEOUT_MS = 2500;

const SYSTEM = `You are a conservative safety screen for a teen support app. Decide whether the student's message signals a real crisis needing immediate human help: self-harm/suicide, abuse, or immediate danger. Ordinary stress, sadness, or frustration is NOT a crisis. Reply ONLY as JSON: {"crisis": boolean, "category": "self-harm"|"abuse"|"danger"|null}.`;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("classifier timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/**
 * Returns a crisis category to escalate, or null to proceed (lexicon-passed).
 * Fail-open on any error/timeout.
 */
export async function classifyCrisis(
  provider: LLMProvider,
  text: string,
  timeoutMs: number = TIMEOUT_MS,
): Promise<CrisisCategory | null> {
  if (provider === verbatimProvider) return null;
  try {
    const res = await withTimeout(
      provider.chat(
        [
          { role: "system", content: SYSTEM },
          { role: "user", content: text },
        ],
        { maxTokens: 100 },
      ),
      timeoutMs,
    );
    const start = res.text.indexOf("{");
    const end = res.text.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    const parsed = JSON.parse(res.text.slice(start, end + 1)) as {
      crisis?: unknown;
      category?: unknown;
    };
    if (parsed.crisis !== true) return null;
    const category = parsed.category;
    if (
      category === "self-harm" ||
      category === "abuse" ||
      category === "danger"
    ) {
      return category;
    }
    // Model flagged a crisis without a valid category — escalate as danger.
    return "danger";
  } catch {
    // Timeout / transport / parse failure → fail open (proceed as passed).
    return null;
  }
}
