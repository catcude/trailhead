import { redirect } from "next/navigation";
import { getFlags } from "@/lib/flags";
import { getRouterOptions, getRouterPrompt } from "@/lib/guidepost/router";
import { createClient } from "@/lib/supabase/server";
import { CheckinClient } from "@/components/guidepost/checkin-client";

// Per-user page: always rendered at request time (auth via cookies).
export const dynamic = "force-dynamic";

export const metadata = { title: "Daily check-in — Trailhead" };

export default async function CheckinPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const flags = getFlags();

  // Offer to resume the most recent unfinished check-in (WS8).
  const { data: openSession } = await supabase
    .from("chat_sessions")
    .select("id")
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="flex flex-1 flex-col">
      <CheckinClient
        routerPrompt={getRouterPrompt().text}
        routerOptions={getRouterOptions(flags).map(({ id, label }) => ({
          id,
          label,
        }))}
        resumeSessionId={openSession?.id ?? null}
      />
    </main>
  );
}
