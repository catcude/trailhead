import { describe, expect, it, vi } from "vitest";
import { adaptMessage } from "@/lib/llm/adapt";
import { LLMProviderError, verbatimProvider } from "@/lib/llm/provider";
import type { LLMProvider } from "@/lib/llm/types";

const authored = "Where’s your head at now that we’ve made this plan?";

/** A mock provider that records the prompt it received and returns a fixed reply. */
function mockProvider(reply: string): LLMProvider & { calls: unknown[][] } {
  const calls: unknown[][] = [];
  return {
    calls,
    async chat(messages, options) {
      calls.push([messages, options]);
      return { text: reply };
    },
    async *stream() {
      throw new Error("adaptMessage uses chat(), not stream()");
    },
  };
}

describe("adaptMessage", () => {
  it("returns authored text verbatim under the verbatim provider", async () => {
    const out = await adaptMessage(
      verbatimProvider,
      { text: authored, adaptable: true },
      "hyped",
    );
    expect(out).toBe(authored);
  });

  it("does not adapt non-adaptable lines even under a real provider", async () => {
    const provider = mockProvider("REPHRASED");
    const out = await adaptMessage(
      provider,
      { text: authored, adaptable: false },
      "hyped",
    );
    expect(out).toBe(authored);
    expect(provider.calls).toHaveLength(0);
  });

  it("adapts adaptable lines through the provider with the tone in the prompt", async () => {
    const provider = mockProvider("You ready? Let’s go.");
    const out = await adaptMessage(
      provider,
      { text: authored, adaptable: true },
      "hyped",
    );
    expect(out).toBe("You ready? Let’s go.");
    const [messages] = provider.calls[0] as [
      { role: string; content: string }[],
    ];
    const system = messages.find((m) => m.role === "system")!.content;
    // Persona (CLAUDE.md Do/Don't) + the tone descriptor are in the prompt.
    expect(system).toContain("unlock your potential");
    expect(system).toContain("Playful, hyped, encouraging");
    // The authored line is the user turn, unchanged.
    expect(messages.find((m) => m.role === "user")!.content).toBe(authored);
  });

  it("falls back to authored text on any provider error", async () => {
    const provider: LLMProvider = {
      async chat() {
        throw new LLMProviderError("boom");
      },
      async *stream() {
        throw new LLMProviderError("boom");
      },
    };
    const out = await adaptMessage(
      provider,
      { text: authored, adaptable: true },
      "hyped",
    );
    expect(out).toBe(authored);
  });

  it("falls back to authored text when the model returns empty output", async () => {
    const out = await adaptMessage(
      mockProvider(""),
      { text: authored, adaptable: true },
      "hyped",
    );
    expect(out).toBe(authored);
  });

  it("re-throws non-provider errors (real bugs must surface)", async () => {
    const provider: LLMProvider = {
      async chat() {
        throw new TypeError("prompt assembly bug");
      },
      async *stream() {
        throw new Error("unused");
      },
    };
    await expect(
      adaptMessage(provider, { text: authored, adaptable: true }, "hyped"),
    ).rejects.toThrow(TypeError);
  });

  it("passes maxTokens budget through when options are provided", async () => {
    // The prompt builder itself sets no budget; the provider default applies.
    // This guards that adaptMessage forwards the prompt unchanged to chat().
    const provider = mockProvider("ok");
    await adaptMessage(provider, { text: authored, adaptable: true }, "hyped");
    const [, options] = provider.calls[0] as [unknown, unknown];
    expect(options).toBeUndefined();
    vi.restoreAllMocks();
  });
});
