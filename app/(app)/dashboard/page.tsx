import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";

// Per-user page: always rendered at request time (auth via cookies).
export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard — Trailhead" };

/*
 * Dashboard stub (M0). Habit Tracker, Aha! log, and Weekly Horizon arrive
 * with M1–M2 per docs/plans/scaffolding-plan.md.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.role || !profile?.display_name) redirect("/onboarding");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-depth">
          Hey, {profile.display_name}
        </h1>
        <form action={signOut}>
          <Button variant="ghost" type="submit">
            Sign out
          </Button>
        </form>
      </header>

      <Card>
        <h2 className="mb-1 font-semibold text-depth">Daily check-in</h2>
        <p className="mb-3 text-sm">
          A few minutes with Juniper — meet the day where you actually are.
        </p>
        <Link
          href="/checkin"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-cta px-6 py-2.5 text-lg font-semibold text-white transition-colors hover:bg-cta/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-depth"
        >
          Start today’s check-in
        </Link>
      </Card>

      <Card>
        <h2 className="mb-1 font-semibold text-depth">Your tools</h2>
        <p className="text-sm">
          Habit tracker and Aha! moments are coming. Honest answer: not built
          yet.
        </p>
      </Card>
    </main>
  );
}
