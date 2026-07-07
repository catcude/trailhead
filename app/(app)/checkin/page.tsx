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
  return (
    <main className="flex flex-1 flex-col">
      <CheckinClient
        routerPrompt={getRouterPrompt().text}
        routerOptions={getRouterOptions(flags).map(({ id, label }) => ({
          id,
          label,
        }))}
      />
    </main>
  );
}
