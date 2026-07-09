"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { currentWeekStart } from "@/lib/utils/week";

/**
 * Dashboard server actions (WS6). Every action authenticates and writes only
 * the current user's rows; RLS is the backstop. No analytics, no tracking.
 */
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");
  return { supabase, user };
}

export async function createHabit(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title || title.length > 120) return;
  const { supabase, user } = await requireUser();
  await supabase.from("habits").insert({ user_id: user.id, title });
  revalidatePath("/dashboard");
}

export async function archiveHabit(habitId: string) {
  const { supabase } = await requireUser();
  await supabase
    .from("habits")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", habitId);
  revalidatePath("/dashboard");
}

/** Toggle today's check for a habit: add it if missing, remove it if present. */
export async function toggleHabitToday(habitId: string) {
  const { supabase } = await requireUser();
  const today = new Date().toISOString().slice(0, 10);
  const existing = await supabase
    .from("habit_checks")
    .select("id")
    .eq("habit_id", habitId)
    .eq("checked_on", today)
    .maybeSingle();
  if (existing.data) {
    await supabase.from("habit_checks").delete().eq("id", existing.data.id);
  } else {
    await supabase
      .from("habit_checks")
      .insert({ habit_id: habitId, checked_on: today });
  }
  revalidatePath("/dashboard");
}

export async function setWeeklyHorizon(intentions: string[]) {
  const cleaned = intentions
    .map((i) => i.trim())
    .filter(Boolean)
    .slice(0, 10);
  const { supabase, user } = await requireUser();
  await supabase.from("weekly_horizons").upsert(
    {
      user_id: user.id,
      week_start: currentWeekStart(),
      intentions: cleaned,
    },
    { onConflict: "user_id,week_start" },
  );
  revalidatePath("/dashboard");
}

export async function addAha(text: string, tag: string | null) {
  const clean = text.trim();
  if (!clean) return;
  const { supabase, user } = await requireUser();
  await supabase
    .from("aha_moments")
    .insert({ user_id: user.id, text: clean, tag: tag?.trim() || null });
  revalidatePath("/dashboard");
}
