import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * CLAUDE.md §LLM Abstraction: "No direct SDK imports outside lib/llm/."
 * This guard fails the build if the Anthropic SDK leaks into any other layer
 * (components, routes, content, other lib modules). The provider is the only
 * seam that may touch a vendor SDK.
 */
const ROOT = join(import.meta.dirname, "..", "..");
const ALLOWED_PREFIX = join("lib", "llm");
const SKIP = new Set(["node_modules", ".next", ".git", "dist", "coverage"]);

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry)) acc.push(full);
  }
  return acc;
}

describe("Anthropic SDK confinement", () => {
  it("is imported only inside lib/llm/", () => {
    const offenders: string[] = [];
    for (const file of walk(ROOT)) {
      const rel = file.slice(ROOT.length + 1);
      if (rel.startsWith(ALLOWED_PREFIX)) continue;
      if (rel.startsWith("tests")) continue; // tests may reference it by name
      const src = readFileSync(file, "utf8");
      if (src.includes("@anthropic-ai/sdk")) offenders.push(rel);
    }
    expect(
      offenders,
      `SDK imported outside lib/llm/: ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});
