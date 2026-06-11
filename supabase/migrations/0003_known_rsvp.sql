-- ============================================================
-- Borderless — "Known RSVPs" (in-person) added to the displayed count
-- Supersedes 0002: adds events.known_rsvp and makes the displayed
-- count = online sign-ups + known_rsvp. Safe to run even if 0002 ran.
-- Run once in the Supabase SQL Editor.
-- ============================================================

alter table public.events
  add column if not exists known_rsvp integer not null default 0;

-- Displayed RSVP count = real rsvps rows + the admin's known (in-person) count.
create or replace function public.sync_event_rsvp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  eid uuid := coalesce(NEW.event_id, OLD.event_id);
begin
  update public.events
     set rsvp = (select count(*) from public.rsvps where event_id = eid)
                + coalesce(known_rsvp, 0)
   where id = eid;
  return null;
end;
$$;

drop trigger if exists rsvps_sync_count on public.rsvps;
create trigger rsvps_sync_count
  after insert or delete or update of event_id on public.rsvps
  for each row execute function public.sync_event_rsvp();

-- One-time: set every event's displayed count to (real RSVPs + known).
update public.events
   set rsvp = (select count(*) from public.rsvps r where r.event_id = events.id)
              + coalesce(known_rsvp, 0);
