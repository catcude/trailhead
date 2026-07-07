import { z } from "zod";

/**
 * /api/checkin request contract. `router` starts a session (option id from
 * the entry router); everything else drives an existing session.
 */
export const CheckinInputSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("router"), optionId: z.string().min(1) }),
  z.object({ type: z.literal("start") }),
  z.object({ type: z.literal("option"), optionId: z.string().min(1) }),
  z.object({ type: z.literal("text"), text: z.string().min(1).max(4000) }),
  z.object({ type: z.literal("toolResult"), payload: z.unknown().optional() }),
  z.object({
    type: z.literal("fallback"),
    kind: z.enum(["idk", "nothingSoundsRight", "stillStuck"]),
  }),
]);

export const CheckinBodySchema = z.object({
  sessionId: z.string().uuid().optional(),
  input: CheckinInputSchema,
  clientLocalHour: z.number().int().min(0).max(23),
});

export type CheckinBody = z.infer<typeof CheckinBodySchema>;

/** Fallback trigger labels shown as user messages (drafts, needsCat). */
export const FALLBACK_LABELS: Record<string, string> = {
  idk: "I don’t know",
  nothingSoundsRight: "Nothing sounds right",
  stillStuck: "Still stuck",
};

/** The terminal SSE `state` frame /api/checkin sends after each turn. */
export interface CheckinStateFrame {
  sessionId: string;
  nodeId: string;
  stage: number;
  toneTag: string;
  options: { id: string; label: string }[] | null;
  tool: { type: string; props?: Record<string, unknown> } | null;
  quotes: string[] | null;
  tip: {
    title?: string;
    body?: string;
    gapRef?: string;
  } | null;
  fallbacks: ("idk" | "nothingSoundsRight" | "stillStuck")[] | null;
  freeText: boolean;
  done: boolean;
  safety?: boolean;
}
