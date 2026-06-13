-- ============================================================
-- Borderless — split attendance from paying attendance
-- guest_count: anonymous walk-ins (no account) — count toward headcount + revenue
-- paid_attended: paying attendees (non-admin members + guests) — drives revenue
--   (admins/staff attend free; they still count toward attendance/participation)
-- Run once in the Supabase SQL Editor.
-- ============================================================
alter table public.events add column if not exists guest_count integer not null default 0;
alter table public.events add column if not exists paid_attended integer;
