import { describe, expect, it } from "vitest";
import { interpretBrainDump, splitItems } from "@/lib/llm/interpret";
import { LLMProviderError, verbatimProvider } from "@/lib/llm/provider";
import type { LLMProvider } from "@/lib/llm/types";

function jsonProvider(reply: string): LLMProvider {
  return {
    async chat() {
      return { text: reply };
    },
    async *stream() {
      yield reply;
    },
  };
}

const dump = "study for bio test, text mom back, laundry; call coach";

describe("splitItems (deterministic fallback)", () => {
  it("splits on commas, semicolons, and newlines", () => {
    expect(splitItems(dump)).toEqual([
      "study for bio test",
      "text mom back",
      "laundry",
      "call coach",
    ]);
  });

  it("strips bullets and blank lines", () => {
    expect(splitItems("- a\n* b\n\n  c  ")).toEqual(["a", "b", "c"]);
  });

  it("caps the item count", () => {
    const many = Array.from({ length: 30 }, (_, i) => `t${i}`).join("\n");
    expect(splitItems(many)).toHaveLength(12);
  });
});

describe("interpretBrainDump", () => {
  it("uses the deterministic split under the verbatim provider", async () => {
    expect(await interpretBrainDump(verbatimProvider, dump)).toEqual(
      splitItems(dump),
    );
  });

  it("parses a clean JSON reply from a real provider", async () => {
    const provider = jsonProvider('{"items": ["bio test", "text mom"]}');
    expect(await interpretBrainDump(provider, dump)).toEqual([
      "bio test",
      "text mom",
    ]);
  });

  it("tolerates preamble around the JSON object", async () => {
    const provider = jsonProvider('Here you go:\n{"items": ["a", "b"]}\nDone.');
    expect(await interpretBrainDump(provider, dump)).toEqual(["a", "b"]);
  });

  it("falls back to the split on malformed JSON", async () => {
    const provider = jsonProvider("not json at all");
    expect(await interpretBrainDump(provider, dump)).toEqual(splitItems(dump));
  });

  it("falls back to the split when the model returns no items", async () => {
    const provider = jsonProvider('{"items": []}');
    expect(await interpretBrainDump(provider, dump)).toEqual(splitItems(dump));
  });

  it("falls back to the split on a provider error", async () => {
    const provider: LLMProvider = {
      async chat() {
        throw new LLMProviderError("boom");
      },
      async *stream() {
        throw new LLMProviderError("boom");
      },
    };
    expect(await interpretBrainDump(provider, dump)).toEqual(splitItems(dump));
  });
});
