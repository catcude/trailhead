import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { isBillingConfigured } from "@/lib/billing/config";
import { isSubscribed } from "@/lib/billing/entitlement";
import { startCheckout, openPortal } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings — Trailhead" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const subscribed = await isSubscribed(supabase);
  const billingOn = isBillingConfigured();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-depth">Settings</h1>

      <Card>
        <h2 className="mb-1 font-semibold text-depth">Plan</h2>
        {subscribed ? (
          <>
            <p className="mb-3 text-sm">
              You’re on the paid plan — unlimited check-ins and the full
              dashboard. Cancel any time; it takes two taps and there are no
              tricks.
            </p>
            <form action={openPortal}>
              <Button type="submit" variant="secondary">
                Manage or cancel
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="mb-3 text-sm">
              You’re on the free plan: one full check-in a day and unlimited
              Mini Resets. Upgrade whenever you want unlimited check-ins — no
              pressure, cancel in two taps.
            </p>
            {billingOn ? (
              <form action={startCheckout}>
                <Button type="submit">Upgrade</Button>
              </form>
            ) : (
              <p className="text-sm text-ink/60">
                Upgrades aren’t switched on in this environment yet.
              </p>
            )}
          </>
        )}
      </Card>

      <Card>
        <p className="text-sm">Profile and quiz retakes will live here too.</p>
      </Card>
    </main>
  );
}
