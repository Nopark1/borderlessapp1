-- ============================================================
-- Borderless — RSVP count sync (Phase: account cleanup)
-- Keeps events.rsvp equal to the real number of rows in `rsvps`,
-- and clears the seeded placeholder counts.
-- Run this once in the Supabase SQL Editor.
-- ============================================================

-- Recompute an event's RSVP count whenever its rsvps change.
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
   where id = eid;
  return null;
end;
$$;

drop trigger if exists rsvps_sync_count on public.rsvps;
create trigger rsvps_sync_count
  after insert or delete or update of event_id on public.rsvps
  for each row execute function public.sync_event_rsvp();

-- One-time cleanup: replace placeholder counts with the real number of RSVPs.
update public.events
   set rsvp = (select count(*) from public.rsvps r where r.event_id = events.id);
