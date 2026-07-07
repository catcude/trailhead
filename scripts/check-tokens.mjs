#!/usr/bin/env node
/**
 * Design-token guard: components never hardcode hex colors.
 *
 * The Patagonia palette lives in app/globals.css as CSS variables (the single
 * source of truth — see docs/plans/scaffolding-plan.md §M0). Everything else
 * must reference tokens (Tailwind classes / var(--...)), so this script fails
 * CI when a raw hex literal appears anywhere else in app/, components/, lib/,
 * or content/.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SCAN_DIRS = ["app", "components", "lib", "content"];
const SCAN_EXTENSIONS = [".ts", ".tsx", ".css", ".mjs", ".json"];
const ALLOWED_FILES = new Set(["app/globals.css"]);
const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      yield* walk(path);
    } else if (SCAN_EXTENSIONS.some((ext) => path.endsWith(ext))) {
      yield path;
    }
  }
}

const violations = [];
for (const dir of SCAN_DIRS) {
  let paths;
  try {
    paths = [...walk(join(ROOT, dir))];
  } catch {
    continue; // directory may not exist yet
  }
  for (const path of paths) {
    const rel = relative(ROOT, path);
    if (ALLOWED_FILES.has(rel)) continue;
    const lines = readFileSync(path, "utf8").split("\n");
    lines.forEach((line, i) => {
      const matches = line.match(HEX_PATTERN);
      if (matches) {
        violations.push(`${rel}:${i + 1}  ${matches.join(" ")}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error(
    "Raw hex colors found outside the token file (app/globals.css):\n",
  );
  for (const violation of violations) console.error(`  ${violation}`);
  console.error(
    "\nUse design tokens instead — Tailwind theme classes or var(--...).",
  );
  process.exit(1);
}

console.log("check-tokens: OK — no raw hex outside app/globals.css");
