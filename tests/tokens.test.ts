import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The Patagonia palette (PRD §5.1) lives in app/globals.css as the single
 * source of truth. This test locks the seven confirmed hex values so a token
 * edit is always a deliberate, reviewed change.
 */
const PRD_PALETTE: Record<string, string> = {
  "Sunset Coral": "#f9a971",
  "Bright Orange": "#fb6526",
  "Deep Sky Blue": "#0165a5",
  "Soft Lavender": "#a68deb",
  "Rich Indigo": "#3b2089",
  "Charcoal Gray": "#4a4a4a",
  "Golden Sand": "#d0b280",
};

describe("design tokens", () => {
  const css = readFileSync(
    join(__dirname, "..", "app", "globals.css"),
    "utf8",
  ).toLowerCase();

  it.each(Object.entries(PRD_PALETTE))(
    "defines %s (%s) from the PRD palette",
    (_name, hex) => {
      expect(css).toContain(hex);
    },
  );

  it("declares the palette inside a Tailwind @theme block", () => {
    expect(css).toContain("@theme");
    expect(css).toContain("--color-cta");
    expect(css).toContain("--color-ink");
  });
});
