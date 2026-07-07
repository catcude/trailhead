import type { ReactNode } from "react";

/*
 * Tip boxes appear inside Guidepost stages (e.g. Green Stage 2's
 * urgent-vs-important explainer). The copy always comes from /content —
 * never hardcode Juniper's lines here.
 */
export function TipBox({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="rounded-[var(--radius-card)] bg-coral/15 p-4 text-depth">
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div className="text-sm leading-relaxed">{children}</div>
    </aside>
  );
}
