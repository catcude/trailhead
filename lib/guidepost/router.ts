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
