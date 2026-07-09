import { afterEach, describe, expect, it } from "vitest";
import {
  anthropicProvider,
  getProvider,
  verbatimProvider,
} from "@/lib/llm/provider";

const authored =
  "You’re not broken. Feeling stuck doesn’t mean you’re lazy—it just means something’s in the way. Let’s explore it.";

describe("verbatim provider", () => {
  it("chat returns the authored text unchanged", async () => {
    const result = await verbatimProvider.chat([
      { role: "assistant", content: authored },
    ]);
    expect(result.text).toBe(authored);
  });

  it("stream chunks reassemble to the exact authored text", async () => {
    let assembled = "";
    for await (const chunk of verbatimProvider.stream([
      { role: "assistant", content: authored },
    ])) {
      assembled += chunk;
    }
    expect(assembled).toBe(authored);
  });
});

describe("getProvider", () => {
  const originalKey = process.env.LLM_API_KEY;
  afterEach(() => {
    if (originalKey === undefined) delete process.env.LLM_API_KEY;
    else process.env.LLM_API_KEY = originalKey;
  });

  it("defaults to verbatim", () => {
    expect(getProvider(undefined)).toBe(verbatimProvider);
    expect(getProvider("verbatim")).toBe(verbatimProvider);
  });

  it("anthropic degrades to verbatim when no key is set", () => {
    delete process.env.LLM_API_KEY;
    expect(getProvider("anthropic")).toBe(verbatimProvider);
  });

  it("anthropic is active when a key is present", () => {
    process.env.LLM_API_KEY = "test-key";
    expect(getProvider("anthropic")).toBe(anthropicProvider);
  });

  it("openai is not the chosen provider", () => {
    expect(() => getProvider("openai")).toThrow(/not supported/);
  });

  it("rejects unknown providers", () => {
    expect(() => getProvider("bard")).toThrow(/Unknown/);
  });
});
