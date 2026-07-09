import { describe, expect, it } from "vitest";
import { classifyCrisis } from "@/lib/llm/safety-classifier";
import { verbatimProvider } from "@/lib/llm/provider";
import type { LLMProvider } from "@/lib/llm/types";

function reply(text: string, delayMs = 0): LLMProvider {
  return {
    async chat() {
      if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
      return { text };
    },
    async *stream() {
      yield text;
    },
  };
}

describe("classifyCrisis (add-only second pass)", () => {
  it("never runs under the verbatim provider", async () => {
    expect(await classifyCrisis(verbatimProvider, "anything")).toBeNull();
  });

  it("escalates when the model flags a crisis with a category", async () => {
    const p = reply('{"crisis": true, "category": "abuse"}');
    expect(await classifyCrisis(p, "…")).toBe("abuse");
  });

  it("escalates as danger when flagged without a valid category", async () => {
    const p = reply('{"crisis": true, "category": null}');
    expect(await classifyCrisis(p, "…")).toBe("danger");
  });

  it("proceeds (null) when the model says no crisis", async () => {
    const p = reply('{"crisis": false, "category": null}');
    expect(await classifyCrisis(p, "…")).toBeNull();
  });

  it("fails open (null) on malformed output", async () => {
    expect(await classifyCrisis(reply("no json here"), "…")).toBeNull();
  });

  it("fails open (null) on timeout", async () => {
    const slow = reply('{"crisis": true, "category": "danger"}', 50);
    expect(await classifyCrisis(slow, "…", 10)).toBeNull();
  });
});
