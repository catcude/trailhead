import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { currentWeekStart } from "@/lib/utils/week";

/**
 * Current week's Weekly Horizon intentions for the signed-in user. The
 * check-in's still-stuck fallback reads these back so the student can
 * re-anchor to what they already set (WS6). Owner-only via RLS + auth.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ intentions: [] });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { data } = await supabase
    .from("weekly_horizons")
    .select("intentions")
    .eq("week_start", currentWeekStart())
    .maybeSingle();
  const intentions = Array.isArray(data?.intentions)
    ? (data.intentions as string[])
    : [];
  return NextResponse.json({ intentions });
}
