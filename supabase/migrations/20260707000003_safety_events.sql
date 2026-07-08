-- Safety telemetry (CLAUDE.md §Safety: "No identifiable logging in safety
-- telemetry"). safety_events is AGGREGATE-ONLY by design: category, path,
-- stage, and day — and NOTHING else. There is deliberately NO user_id, NO
-- session_id, and NO text column. Adding any user linkage or free text to
-- this table is a privacy regression, not a feature.
--
-- The weekly escalation review (PRD §9) reads this table via the service role
-- / SQL editor. There is no client read path and no client write path: RLS is
-- on with no policies, so authenticated and anon clients can neither select
-- nor insert directly. The only way in is the security-definer RPC below,
-- which accepts only the three non-identifying dimensions.

create table public.safety_events (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  path public.guidepost_path,
  stage int check (stage between 1 and 6),
  day date not null default current_date
);
create index safety_events_day_idx on public.safety_events (day);

-- RLS on, zero policies → no client read or write of this table, ever.
alter table public.safety_events enable row level security;

-- The only write path. Records the aggregate dimensions and nothing the
-- caller could smuggle a person into (no text/user/session parameter exists).
create function public.log_safety_event(
  p_category text,
  p_path public.guidepost_path,
  p_stage int
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.safety_events (category, path, stage)
    values (p_category, p_path, p_stage);
end;
$$;

revoke execute on function public.log_safety_event(text, public.guidepost_path, int)
  from public, anon;
grant execute on function public.log_safety_event(text, public.guidepost_path, int)
  to authenticated;
