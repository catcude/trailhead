import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Apply a verified Stripe event to our billing tables via the service-role
 * client (these tables have no client write policy). Idempotent by design:
 * every write is an upsert on a unique key, so Stripe's at-least-once retries
 * are safe to reprocess.
 */
export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;
      if (userId && customerId) {
        await supabase
          .from("billing_customers")
          .upsert(
            { user_id: userId, stripe_customer_id: customerId },
            { onConflict: "user_id" },
          );
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const { data: customer } = await supabase
        .from("billing_customers")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      const userId = (customer as { user_id: string } | null)?.user_id;
      if (!userId) break;
      const periodEnd = (sub as { current_period_end?: number })
        .current_period_end;
      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_subscription_id: sub.id,
          status: sub.status,
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_subscription_id" },
      );
      break;
    }
    default:
      // Unhandled event types are acknowledged (200) without action.
      break;
  }
}
