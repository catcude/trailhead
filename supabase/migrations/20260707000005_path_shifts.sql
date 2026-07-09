-- Path permeability (M3). A check-in can shift between paths mid-session
-- (e.g. Blue "head full" → Yellow, Red "feeling regulated" → Green). The
-- active path already lives in chat_sessions.path; this adds an append-only
-- audit of the hops so a session's route can be reconstructed.
--
-- Owner-only, like every other column on chat_sessions — the existing RLS
-- policies and the table-level grants (migration 20260709000001) already
-- cover it; nothing new to grant. This is the user's OWN session data, never
-- exposed to parents/teachers and never part of the identifier-free
-- safety_events telemetry.
--
-- Shape per entry: { "from": path, "to": path, "atNode": nodeId, "at": iso8601 }.
-- Nullable-safe via a default, so sessions created before this migration stay
-- valid and simply carry an empty history.

alter table public.chat_sessions
  add column path_history jsonb not null default '[]'::jsonb;
