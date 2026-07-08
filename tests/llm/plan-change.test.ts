import { describe, expect, it } from "vitest";
import { buildPlanChangePrompt, explainPlanChange } from "@/lib/llm/plan-change";
import { LLMProviderError, verbatimProvider } from "@/lib/llm/provider";
import type { LLMProvider } from "@/lib/llm/types";

const inputs = [
  "I have a bio test tomorrow and I keep putting it off",
  "practice runs late so I only get an hour at night",
];

function replyProvider(reply: string): LLMProvider & { seen: string[] } {
  const seen: string[] = [];
  return {
    seen,
    async chat(messages) {
      for (const m of messages) seen.push(m.content);
      return { text: reply };
    },
    async *stream() {
      yield reply;
    },
  };
}

describe("buildPlanChangePrompt (privacy-scoped)", () => {
  it("includes only the provided session inputs — no profile fields", () => {
    const prompt = buildPlanChangePrompt(inputs);
    const user = prompt.find((m) => m.role === "user")!.content;
    expect(user).toContain("bio test tomorrow");
    expect(user).toContain("practice runs late");
    // Never leaks identity/profile shapes into the prompt.
    for (const banned of ["email", "@", "display_name", "user_id", "profile"]) {
      expect(user.toLowerCase()).not.toContain(banned);
    }
  });

  it("instructs the model to invent nothing", () => {
    const system = buildPlanChangePrompt(inputs).find(
      (m) => m.role === "system",
    )!.content;
    expect(system).toMatch(/Invent nothing/i);
  });
});

describe("explainPlanChange", () => {
  it("returns null under the verbatim provider (M1 behavior preserved)", async () => {
    expect(await explainPlanChange(verbatimProvider, inputs)).toBeNull();
  });

  it("returns null when there are no usable notes", async () => {
    expect(await explainPlanChange(replyProvider("x"), ["", "  "])).toBeNull();
  });

  it("returns the grounded explanation from a real provider", async () => {
    const provider = replyProvider("You pushed study time later because…");
    const out = await explainPlanChange(provider, inputs);
    expect(out).toBe("You pushed study time later because…");
    // The student's own words are the only content sent.
    expect(provider.seen.join(" ")).toContain("bio test tomorrow");
  });

  it("returns null when the model declines with (none)", async () => {
    expect(await explainPlanChange(replyProvider("(none)"), inputs)).toBeNull();
  });

  it("returns null on a provider error", async () => {
    const provider: LLMProvider = {
      async chat() {
        throw new LLMProviderError("boom");
      },
      async *stream() {
        throw new LLMProviderError("boom");
      },
    };
    expect(await explainPlanChange(provider, inputs)).toBeNull();
  });
});
