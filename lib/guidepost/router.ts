import { routerOptions, routerPrompt } from "@/content/router";
import type { PathId } from "@/content/schema";
import type { Flags } from "@/lib/flags";

/**
 * The entry check-in router: maps the user's chosen state to a path.
 * Flag-gated options (Blue, and Red behind its double gate) never surface
 * unless enabled — and Red content additionally refuses to load in
 * production without the signed safety review (enforced in M3).
 */
export function getRouterPrompt() {
  return routerPrompt;
}

export function getRouterOptions(flags: Flags) {
  return routerOptions.filter((option) => {
    if (!option.flag) return true;
    return flags[option.flag];
  });
}

export function routeEntry(optionId: string, flags: Flags): PathId | null {
  const option = getRouterOptions(flags).find((o) => o.id === optionId);
  return option?.path ?? null;
}

/** green/yellow are always available; blue/red only behind their flag(s). */
export function isPathAllowed(path: PathId, flags: Flags): boolean {
  if (path === "blue") return flags.bluePath;
  if (path === "red") return flags.redPath;
  return true;
}

/**
 * Hard backstop behind isPathAllowed's user-facing refusals: a gated path's
 * content must NEVER be served in a production build without its flag(s) (Red
 * additionally needs RED_PATH_RELEASE_APPROVED). If some code path forgets to
 * gate, this fails closed in production instead of leaking Red. In non-prod it
 * is a no-op so preview/test harnesses can exercise gated paths.
 */
export function assertPathServable(path: PathId, flags: Flags): void {
  if (isPathAllowed(path, flags)) return;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Guidepost path "${path}" is gated and not released`);
  }
}
