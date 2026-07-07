-- Guidepost core tables (scaffolding plan §3.4). RLS is enabled in this
-- same migration for every table — owner-only on all student data. There is
-- deliberately NO parent/teacher read path into any of these tables; any
-- future consent-based sharing is a new feature with its own review.

create type public.guidepost_path as enum ('green', 'yellow', 'blue', 'red');
create type public.checkin_variant as enum ('standard', 'evening');

-- ── chat_sessions ─────────────────────────────────────────────────────────────
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  path public.guidepost_path not null,
  variant public.checkin_variant not null default 'standard',
  current_node text not null,
  state jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
create index chat_sessions_user_idx on public.chat_sessions (user_id, started_at desc);
alter table public.chat_sessions enable row level security;
create policy "chat_sessions_select_own" on public.chat_sessions
  for select using ((select auth.uid()) = user_id);
create policy "chat_sessions_insert_own" on public.chat_sessions
  for insert with check ((select auth.uid()) = user_id);
create policy "chat_sessions_update_own" on public.chat_sessions
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "chat_sessions_delete_own" on public.chat_sessions
  for delete using ((select auth.uid()) = user_id);

-- ── chat_messages (owner via session join; continuity, not surveillance) ─────
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  role text not null check (role in ('juniper', 'user')),
  content text not null,
  stage int check (stage between 1 and 6),
  created_at timestamptz not null default now()
);
create index chat_messages_session_idx on public.chat_messages (session_id, created_at);
alter table public.chat_messages enable row level security;
create policy "chat_messages_select_own" on public.chat_messages
  for select using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  );
create policy "chat_messages_insert_own" on public.chat_messages
  for insert with check (
    exists (
      select 1 from public.chat_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  );

-- ── reflections ───────────────────────────────────────────────────────────────
create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid references public.chat_sessions (id) on delete set null,
  quote_text text,
  outcome_tag text,
  created_at timestamptz not null default now()
);
create index reflections_user_idx on public.reflections (user_id, created_at desc);
alter table public.reflections enable row level security;
create policy "reflections_select_own" on public.reflections
  for select using ((select auth.uid()) = user_id);
create policy "reflections_insert_own" on public.reflections
  for insert with check ((select auth.uid()) = user_id);
create policy "reflections_delete_own" on public.reflections
  for delete using ((select auth.uid()) = user_id);

-- ── aha_moments ───────────────────────────────────────────────────────────────
create table public.aha_moments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text text not null,
  tag text,
  source_session uuid references public.chat_sessions (id) on delete set null,
  created_at timestamptz not null default now()
);
create index aha_moments_user_idx on public.aha_moments (user_id, created_at desc);
alter table public.aha_moments enable row level security;
create policy "aha_moments_select_own" on public.aha_moments
  for select using ((select auth.uid()) = user_id);
create policy "aha_moments_insert_own" on public.aha_moments
  for insert with check ((select auth.uid()) = user_id);
create policy "aha_moments_update_own" on public.aha_moments
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "aha_moments_delete_own" on public.aha_moments
  for delete using ((select auth.uid()) = user_id);

-- ── habits / habit_checks ─────────────────────────────────────────────────────
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  cadence text not null default 'daily' check (cadence in ('daily', 'weekly')),
  created_at timestamptz not null default now(),
  archived_at timestamptz
);
create index habits_user_idx on public.habits (user_id);
alter table public.habits enable row level security;
create policy "habits_select_own" on public.habits
  for select using ((select auth.uid()) = user_id);
create policy "habits_insert_own" on public.habits
  for insert with check ((select auth.uid()) = user_id);
create policy "habits_update_own" on public.habits
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "habits_delete_own" on public.habits
  for delete using ((select auth.uid()) = user_id);

create table public.habit_checks (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  checked_on date not null default current_date,
  unique (habit_id, checked_on)
);
alter table public.habit_checks enable row level security;
create policy "habit_checks_select_own" on public.habit_checks
  for select using (
    exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = (select auth.uid())
    )
  );
create policy "habit_checks_insert_own" on public.habit_checks
  for insert with check (
    exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = (select auth.uid())
    )
  );
create policy "habit_checks_delete_own" on public.habit_checks
  for delete using (
    exists (
      select 1 from public.habits h
      where h.id = habit_id and h.user_id = (select auth.uid())
    )
  );

-- ── goals ─────────────────────────────────────────────────────────────────────
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  horizon text not null check (horizon in ('short', 'mid', 'long')),
  category text,
  title text not null check (char_length(title) between 1 and 200),
  status text not null default 'active' check (status in ('active', 'done', 'paused', 'dropped')),
  created_at timestamptz not null default now()
);
create index goals_user_idx on public.goals (user_id);
alter table public.goals enable row level security;
create policy "goals_select_own" on public.goals
  for select using ((select auth.uid()) = user_id);
create policy "goals_insert_own" on public.goals
  for insert with check ((select auth.uid()) = user_id);
create policy "goals_update_own" on public.goals
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "goals_delete_own" on public.goals
  for delete using ((select auth.uid()) = user_id);

-- ── weekly_horizons ───────────────────────────────────────────────────────────
create table public.weekly_horizons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  intentions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);
alter table public.weekly_horizons enable row level security;
create policy "weekly_horizons_select_own" on public.weekly_horizons
  for select using ((select auth.uid()) = user_id);
create policy "weekly_horizons_insert_own" on public.weekly_horizons
  for insert with check ((select auth.uid()) = user_id);
create policy "weekly_horizons_update_own" on public.weekly_horizons
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "weekly_horizons_delete_own" on public.weekly_horizons
  for delete using ((select auth.uid()) = user_id);

-- ── personality_profiles (quiz) ───────────────────────────────────────────────
-- Owner-only, NO exceptions: the in-app confidentiality promise ("answers
-- are used only to shape the experience") is backed here. Scores stay null
-- until the scoring rubric (OQ2) is confirmed; raw answers + quiz_version
-- make them computable retroactively.
create table public.personality_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  raw_answers jsonb not null,
  quiz_version text not null,
  openness int check (openness between 0 and 100),
  conscientiousness int check (conscientiousness between 0 and 100),
  extraversion int check (extraversion between 0 and 100),
  agreeableness int check (agreeableness between 0 and 100),
  resilience int check (resilience between 0 and 100),
  taken_at timestamptz not null default now()
);
alter table public.personality_profiles enable row level security;
create policy "personality_profiles_select_own" on public.personality_profiles
  for select using ((select auth.uid()) = user_id);
create policy "personality_profiles_insert_own" on public.personality_profiles
  for insert with check ((select auth.uid()) = user_id);
create policy "personality_profiles_update_own" on public.personality_profiles
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "personality_profiles_delete_own" on public.personality_profiles
  for delete using ((select auth.uid()) = user_id);

-- ── rate limiting (fixed window, shared across serverless instances) ──────────
-- RLS enabled with NO policies: unreachable directly; access only through
-- the security-definer function below (execute granted to authenticated).
create table public.rate_limit_counters (
  key text primary key,
  window_start timestamptz not null,
  count int not null
);
alter table public.rate_limit_counters enable row level security;

create function public.check_rate_limit(p_key text, p_limit int, p_window_ms int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  now_ts timestamptz := now();
  new_count int;
begin
  loop
    update public.rate_limit_counters
      set count = case
            when now_ts - window_start >= make_interval(secs => p_window_ms / 1000.0)
              then 1 else count + 1 end,
          window_start = case
            when now_ts - window_start >= make_interval(secs => p_window_ms / 1000.0)
              then now_ts else window_start end
      where key = p_key
      returning count into new_count;
    if found then
      return new_count <= p_limit;
    end if;
    begin
      insert into public.rate_limit_counters (key, window_start, count)
        values (p_key, now_ts, 1);
      return true;
    exception when unique_violation then
      -- lost a race; retry the update
    end;
  end loop;
end;
$$;

revoke execute on function public.check_rate_limit(text, int, int) from public, anon;
grant execute on function public.check_rate_limit(text, int, int) to authenticated;
