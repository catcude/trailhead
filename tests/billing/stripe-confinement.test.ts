import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Stripe SDK confinement (buildmap §10, mirroring the LLM-layer rule): the
 * `stripe` package may be imported only under lib/billing/. Every other layer
 * — routes, actions, components — must go through that module.
 */
const ROOT = join(import.meta.dirname, "..", "..");
const ALLOWED_PREFIX = join("lib", "billing");
const SKIP = new Set(["node_modules", ".next", ".git", "dist", "coverage"]);
const IMPORT_RE = /(from\s+["']stripe["']|require\(["']stripe["']\))/;

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry)) acc.push(full);
  }
  return acc;
}

describe("Stripe SDK confinement", () => {
  it("is imported only inside lib/billing/", () => {
    const offenders: string[] = [];
    for (const file of walk(ROOT)) {
      const rel = file.slice(ROOT.length + 1);
      if (rel.startsWith(ALLOWED_PREFIX)) continue;
      if (rel.startsWith("tests")) continue;
      if (IMPORT_RE.test(readFileSync(file, "utf8"))) offenders.push(rel);
    }
    expect(
      offenders,
      `Stripe imported outside lib/billing/: ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});
