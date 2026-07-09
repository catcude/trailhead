-- Freemium billing (PRD §6.5). Anti-money-grab is a core value: transparent
-- tiers, cancel in two taps. These tables are written ONLY server-side via the
-- Stripe webhook (service role) — clients may read their own billing state but
-- can never write it (no insert/update/delete policies).

create table public.billing_customers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now()
);
alter table public.billing_customers enable row level security;
create policy "billing_customers_select_own" on public.billing_customers
  for select using ((select auth.uid()) = user_id);
-- No insert/update/delete policies: writes are service-role only (webhook).

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_subscription_id text not null unique,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id);
alter table public.subscriptions enable row level security;
create policy "subscriptions_select_own" on public.subscriptions
  for select using ((select auth.uid()) = user_id);
-- No client write policies: the webhook (service role) is the only writer.
