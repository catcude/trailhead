import type { QuoteBank } from "../schema";

/**
 * VERBATIM from docs/paths/blue-path.md §Reflection Tags. The doc provides one
 * set (no separate evening bank), so both variants use it — same handling as
 * Green/Yellow; noted for Cat (gap G-T3 covers evening sets for non-Green
 * paths). The ✨ bullet in the doc is decorative, not part of the quote.
 */
const quotes = [
  "I noticed something I’d been ignoring.",
  "I gave myself space instead of pressure.",
  "I moved a little closer to feeling like me.",
  "Today didn’t hijack my whole vibe.",
  "I didn’t rush. I listened.",
];

export const blueQuotes: QuoteBank = {
  path: "blue",
  sourceRef: "paths/blue-path.md §Reflection Tags",
  standard: quotes,
  evening: quotes,
};
