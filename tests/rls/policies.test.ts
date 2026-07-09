import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * RLS policy tests — the privacy promise, executable.
 *
 * Runs only when SUPABASE_TEST_URL is set (CI `rls` job spins up a local
 * Supabase stack; locally: `supabase start` + export the printed env).
 * Seeds two users and proves: cross-user reads return nothing, cross-user
 * writes fail, anon sees nothing, and chat_messages are unreachable through
 * another user's session.
 */
const url = process.env.SUPABASE_TEST_URL;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY;
const serviceKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const configured = Boolean(url && anonKey && serviceKey);

const suite = configured ? describe : describe.skip;

suite("row level security (owner-only, no exceptions)", () => {
  let alice: SupabaseClient;
  let bob: SupabaseClient;
  let anon: SupabaseClient;
  let aliceId: string;
  let aliceSessionId: string;

  beforeAll(async () => {
    const admin = createClient(url!, serviceKey!);
    const password = "test-password-123!";
    const stamp = Date.now();

    async function makeUser(name: string) {
      const email = `${name}-${stamp}@rls-test.local`;
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) throw error;
      const client = createClient(url!, anonKey!);
      const { error: signInError } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      return { client, id: data.user.id };
    }

    const a = await makeUser("alice");
    const b = await makeUser("bob");
    alice = a.client;
    bob = b.client;
    aliceId = a.id;
    anon = createClient(url!, anonKey!);

    // Seed one row per table as alice.
    const session = await alice
      .from("chat_sessions")
      .insert({
        user_id: aliceId,
        path: "green",
        variant: "standard",
        current_node: "welcome",
        state: {},
      })
      .select("id")
      .single();
    if (session.error) throw session.error;
    aliceSessionId = session.data.id;

    const seeds: [string, Record<string, unknown>][] = [
      [
        "chat_messages",
        {
          session_id: aliceSessionId,
          role: "user",
          content: "private",
          stage: 1,
        },
      ],
      ["reflections", { user_id: aliceId, quote_text: "private quote" }],
      ["aha_moments", { user_id: aliceId, text: "private insight" }],
      ["habits", { user_id: aliceId, title: "drink water" }],
      ["goals", { user_id: aliceId, horizon: "short", title: "private goal" }],
      [
        "weekly_horizons",
        { user_id: aliceId, week_start: "2026-07-06", intentions: [] },
      ],
      [
        "personality_profiles",
        { user_id: aliceId, raw_answers: { q1: "A" }, quiz_version: "v1" },
      ],
    ];
    for (const [table, row] of seeds) {
      const { error } = await alice.from(table).insert(row);
      if (error) throw new Error(`seeding ${table}: ${error.message}`);
    }
  });

  const tables = [
    "chat_sessions",
    "chat_messages",
    "reflections",
    "aha_moments",
    "habits",
    "goals",
    "weekly_horizons",
    "personality_profiles",
  ];

  for (const table of tables) {
    it(`${table}: owner sees their row`, async () => {
      const { data, error } = await alice.from(table).select("*");
      expect(error).toBeNull();
      expect(data!.length).toBeGreaterThan(0);
    });

    it(`${table}: another user sees NOTHING`, async () => {
      const { data, error } = await bob.from(table).select("*");
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it(`${table}: anon sees NOTHING`, async () => {
      const { data } = await anon.from(table).select("*");
      expect(data ?? []).toEqual([]);
    });
  }

  it("cross-user insert into another user's data fails", async () => {
    const { error } = await bob
      .from("reflections")
      .insert({ user_id: aliceId, quote_text: "forged" });
    expect(error).not.toBeNull();
  });

  it("chat_messages are unreachable via another user's session id", async () => {
    const { error } = await bob.from("chat_messages").insert({
      session_id: aliceSessionId,
      role: "user",
      content: "intruder",
      stage: 1,
    });
    expect(error).not.toBeNull();
  });

  it("cross-user update of a profile row fails silently (0 rows)", async () => {
    const { data, error } = await bob
      .from("personality_profiles")
      .update({ quiz_version: "tampered" })
      .eq("user_id", aliceId)
      .select();
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("rate_limit_counters are not directly accessible, RPC works", async () => {
    const direct = await alice.from("rate_limit_counters").select("*");
    expect(direct.data ?? []).toEqual([]);

    const rpc = await alice.rpc("check_rate_limit", {
      p_key: `test-${Date.now()}`,
      p_limit: 2,
      p_window_ms: 60000,
    });
    expect(rpc.error).toBeNull();
    expect(rpc.data).toBe(true);
  });

  it("rate limit RPC enforces the window limit", async () => {
    const key = `limit-${Date.now()}`;
    const call = () =>
      alice.rpc("check_rate_limit", {
        p_key: key,
        p_limit: 2,
        p_window_ms: 60000,
      });
    expect((await call()).data).toBe(true);
    expect((await call()).data).toBe(true);
    expect((await call()).data).toBe(false);
  });

  it("anon cannot call the rate limit RPC", async () => {
    const { error } = await anon.rpc("check_rate_limit", {
      p_key: "anon-key",
      p_limit: 2,
      p_window_ms: 60000,
    });
    expect(error).not.toBeNull();
  });

  // ── safety_events: identifier-free, no client read/write, RPC-only insert ──
  it("safety_events is not directly readable by an authenticated user", async () => {
    const { data } = await alice.from("safety_events").select("*");
    expect(data ?? []).toEqual([]);
  });

  it("safety_events cannot be inserted into directly (no write policy)", async () => {
    const { error } = await alice
      .from("safety_events")
      .insert({ category: "self-harm", path: "green", stage: 1 });
    expect(error).not.toBeNull();
  });

  it("log_safety_event RPC works for an authenticated user", async () => {
    const { error } = await alice.rpc("log_safety_event", {
      p_category: "self-harm",
      p_path: "green",
      p_stage: 3,
    });
    expect(error).toBeNull();
  });

  it("anon cannot call log_safety_event", async () => {
    const { error } = await anon.rpc("log_safety_event", {
      p_category: "danger",
      p_path: "yellow",
      p_stage: 2,
    });
    expect(error).not.toBeNull();
  });

  // ── billing: owner may read, clients may never write (webhook-only) ────────
  it("billing_customers has no client insert policy", async () => {
    const { error } = await alice
      .from("billing_customers")
      .insert({ user_id: aliceId, stripe_customer_id: "cus_forged" });
    expect(error).not.toBeNull();
  });

  it("subscriptions has no client insert policy", async () => {
    const { error } = await alice.from("subscriptions").insert({
      user_id: aliceId,
      stripe_subscription_id: "sub_forged",
      status: "active",
    });
    expect(error).not.toBeNull();
  });

  it("another user cannot read billing rows", async () => {
    const { data } = await bob.from("subscriptions").select("*");
    expect(data ?? []).toEqual([]);
  });
});

if (!configured) {
  describe("row level security", () => {
    it.skip("skipped — set SUPABASE_TEST_URL/_ANON_KEY/_SERVICE_ROLE_KEY (CI runs this against a local stack)", () => {});
  });
}
