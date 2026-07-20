-- ============================================================
-- Borderless — Blog article analytics
-- Raw events (impression / view / dwell). Admin accounts are filtered out
-- server-side before insert, so this table only holds non-admin activity.
-- Run once in the Supabase SQL Editor.
-- ============================================================

create table if not exists public.article_events (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null,
  type       text not null,            -- 'impression' | 'view' | 'dwell'
  ms         integer,                  -- dwell time in ms (for type='dwell')
  session    text,                     -- anonymous per-browser id (unique-ish readers)
  created_at timestamptz not null default now()
);

create index if not exists article_events_slug_type_idx on public.article_events (slug, type);

alter table public.article_events enable row level security;

-- Anyone may record an event (the /api/journal/track route already drops admin
-- traffic before inserting). Only admins can read the aggregated data.
drop policy if exists article_events_insert on public.article_events;
create policy article_events_insert on public.article_events
  for insert
  with check (true);

drop policy if exists article_events_admin_read on public.article_events;
create policy article_events_admin_read on public.article_events
  for select
  using (public.is_admin());

grant insert on public.article_events to anon, authenticated;
grant select on public.article_events to authenticated;
