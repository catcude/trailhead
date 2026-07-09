import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { collectAuthoredStrings } from "@/content";

/**
 * Voice-lint — the deterministic, BLOCKING half of the PRD §8 tone eval.
 * It regression-tests Juniper's voice against CLAUDE.md's Do/Don't guide
 * before any copy or prompt change ships, with zero LLM cost. The LLM judge
 * (tone-judge.test.ts) is the non-blocking companion.
 *
 * Three guarantees:
 *  1. No banned lexicon in any user-facing string (clinical terms + ed-tech
 *     buzzwords the brand voice forbids).
 *  2. The crisis safety copy is present and intact (boundary line + hotlines).
 *  3. Juniper's prose stays readable for a 14-year-old (aggregate reading
 *     level), so copy drift toward complexity fails the build.
 */

// CLAUDE.md §Brand Voice Don't — clinical/diagnostic language + ed-tech buzz.
const BANNED = [
  "disorder",
  "deficit",
  "intervention",
  "diagnose",
  "diagnosis",
  "gamified",
  "gamification",
  "unlock your potential",
];

const authored = collectAuthoredStrings();

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
}

const UI_ROOTS = ["components", "app", "content"];
const ROOT = join(import.meta.dirname, "..", "..");

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx)$/.test(entry)) acc.push(full);
  }
  return acc;
}

describe("voice-lint: banned lexicon (blocking)", () => {
  it("no authored/content string uses a forbidden term", () => {
    const hits: string[] = [];
    for (const [key, value] of Object.entries(authored)) {
      const lower = value.toLowerCase();
      for (const term of BANNED) {
        if (lower.includes(term)) hits.push(`${key}: "${term}"`);
      }
    }
    expect(hits, `banned term in content: ${hits.join("; ")}`).toEqual([]);
  });

  it("no UI source (comments stripped) uses a forbidden term", () => {
    const hits: string[] = [];
    for (const root of UI_ROOTS) {
      for (const file of walk(join(ROOT, root))) {
        const src = stripComments(readFileSync(file, "utf8")).toLowerCase();
        for (const term of BANNED) {
          if (src.includes(term))
            hits.push(`${file.slice(ROOT.length + 1)}: "${term}"`);
        }
      }
    }
    expect(hits, `banned term in UI source: ${hits.join("; ")}`).toEqual([]);
  });
});

describe("voice-lint: safety copy present (blocking)", () => {
  it("keeps the authored boundary line verbatim", () => {
    expect(authored["safety/crisis/boundary"]).toBe(
      "I’m not a counselor, but here’s someone who can help.",
    );
  });

  it("surfaces both hotlines", () => {
    const resources = Object.entries(authored)
      .filter(([k]) => k.startsWith("safety/crisis/resource/"))
      .map(([, v]) => v)
      .join(" ");
    expect(resources).toContain("988");
    expect(resources).toContain("741741");
  });
});

// ── Readability (Flesch–Kincaid grade level) ────────────────────────────────
function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return w.length ? 1 : 0;
  const groups = w.replace(/e\b/, "").match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

function fkGrade(text: string): number {
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length);
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const syl = words.reduce((n, w) => n + syllables(w), 0);
  return (
    0.39 * (words.length / sentences) + 11.8 * (syl / words.length) - 15.59
  );
}

/** Juniper prose lines only (not option labels, quotes, or fragments). */
const juniperProse = Object.entries(authored)
  .filter(([k]) => /\/(juniper|juniper\.evening|response)$/.test(k))
  .map(([, v]) => v);

describe("voice-lint: readability (blocking regression guard)", () => {
  it("Juniper's prose reads at roughly grade 8 on average", () => {
    const grades = juniperProse.map(fkGrade);
    const mean = grades.reduce((a, b) => a + b, 0) / grades.length;
    // Grade 8 target with headroom for punchy, contraction-heavy voice; a
    // systematic drift toward complexity trips this before it ships.
    expect(mean).toBeLessThanOrEqual(9);
  });
});
