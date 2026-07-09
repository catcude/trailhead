import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  canStartCheckin,
  checkinsToday,
  isSubscribed,
} from "@/lib/billing/entitlement";

type Sub = { status: string; current_period_end: string | null };

/**
 * A tiny chainable mock: `.select()/.eq()/.gte()` all return the same thenable,
 * which resolves to {data} for subscriptions and {count} for chat_sessions.
 */
function mockSupabase(opts: { subs?: Sub[]; count?: number }): SupabaseClient {
  const make = (table: string) => {
    const chain = {
      select: () => chain,
      eq: () => chain,
      gte: () => chain,
      then: (resolve: (v: unknown) => void) =>
        resolve(
          table === "subscriptions"
            ? { data: opts.subs ?? [] }
            : { count: opts.count ?? 0 },
        ),
    };
    return chain;
  };
  return { from: (table: string) => make(table) } as unknown as SupabaseClient;
}

const NOW = new Date("2026-07-08T12:00:00Z");

describe("isSubscribed", () => {
  it("true for an active sub with no period end", async () => {
    const s = mockSupabase({
      subs: [{ status: "active", current_period_end: null }],
    });
    expect(await isSubscribed(s, NOW)).toBe(true);
  });

  it("true for a trialing sub ending in the future", async () => {
    const s = mockSupabase({
      subs: [
        { status: "trialing", current_period_end: "2026-08-01T00:00:00Z" },
      ],
    });
    expect(await isSubscribed(s, NOW)).toBe(true);
  });

  it("false once the period has lapsed", async () => {
    const s = mockSupabase({
      subs: [{ status: "active", current_period_end: "2026-07-01T00:00:00Z" }],
    });
    expect(await isSubscribed(s, NOW)).toBe(false);
  });

  it("false for canceled/none", async () => {
    expect(
      await isSubscribed(
        mockSupabase({
          subs: [{ status: "canceled", current_period_end: null }],
        }),
        NOW,
      ),
    ).toBe(false);
    expect(await isSubscribed(mockSupabase({ subs: [] }), NOW)).toBe(false);
  });
});

describe("checkinsToday + canStartCheckin (free = 1/day)", () => {
  it("counts today's sessions", async () => {
    expect(await checkinsToday(mockSupabase({ count: 2 }), "u", NOW)).toBe(2);
  });

  it("free user may start with none today", async () => {
    expect(await canStartCheckin(mockSupabase({ count: 0 }), "u", NOW)).toBe(
      true,
    );
  });

  it("free user is blocked after the first today", async () => {
    expect(await canStartCheckin(mockSupabase({ count: 1 }), "u", NOW)).toBe(
      false,
    );
  });

  it("subscriber is unlimited regardless of count", async () => {
    const s = mockSupabase({
      subs: [{ status: "active", current_period_end: null }],
      count: 9,
    });
    expect(await canStartCheckin(s, "u", NOW)).toBe(true);
  });
});
