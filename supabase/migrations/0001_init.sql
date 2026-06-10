-- ============================================================
-- Borderless — initial schema (Phase 2)
-- Tables from README §2 + Row-Level Security.
-- Run this in the Supabase SQL Editor (see SUPABASE_SETUP.md).
-- ============================================================

-- ---- enums (kept as text + CHECK for simplicity/portability) ----

-- ============================================================
-- events
-- ============================================================
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  cover       text,                              -- palette key OR uploaded image URL
  category    text not null check (category in
                ('cultural','food','nightlife','outdoor','workshop','language')),
  title_en    text not null,
  title_jp    text not null,
  date        date not null,
  time        text,                              -- "HH:MM"
  end_time    text,                              -- "HH:MM"
  venue_en    text,
  venue_jp    text,
  area_en     text,
  area_jp     text,
  price       integer not null default 0,        -- entry fee, yen
  capacity    integer not null default 0,
  cost        integer not null default 0,        -- total event cost, yen (break-even)
  blurb_en    text,
  blurb_jp    text,
  desc_en     text,
  desc_jp     text,
  lat         double precision,
  lng         double precision,
  invited     integer not null default 0,
  rsvp        integer not null default 0,        -- denormalised RSVP count
  attended    integer,                           -- NULL until checked-in
  gallery     integer not null default 0,
  status      text not null default 'draft'
                check (status in ('draft','published','completed')),
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists events_status_date_idx on public.events (status, date);

-- ============================================================
-- members  (extends auth.users)
-- ============================================================
create table if not exists public.members (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text,
  handle      text,
  country     text,
  joined      date not null default current_date,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- rsvps
-- ============================================================
create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  member_id   uuid not null references public.members (id) on delete cascade,
  created_at  timestamptz not null default now(),
  attended    boolean not null default false,
  invited_by  uuid references public.members (id) on delete set null,
  unique (event_id, member_id)
);

-- ============================================================
-- points_ledger  (balance = SUM(points) per member)
-- ============================================================
create table if not exists public.points_ledger (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.members (id) on delete cascade,
  event_id    uuid references public.events (id) on delete set null,
  kind        text not null check (kind in
                ('participation','invite_fresh','invite_returning','redemption')),
  points      integer not null,                  -- positive earns, negative redeems
  created_at  timestamptz not null default now()
);

create index if not exists points_ledger_member_idx on public.points_ledger (member_id);

-- ============================================================
-- rewards  (catalog)
-- ============================================================
create table if not exists public.rewards (
  id          text primary key,
  title_en    text not null,
  title_jp    text not null,
  cost        integer not null,                  -- points
  tag         text check (tag in ('popular','limited'))
);

-- ============================================================
-- helper: is the current user an admin?
-- SECURITY DEFINER so it bypasses RLS and avoids recursive policies.
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select m.is_admin from public.members m where m.id = auth.uid()),
    false
  );
$$;

-- ============================================================
-- auto-create a members row when a new auth user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.members (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table public.events        enable row level security;
alter table public.members       enable row level security;
alter table public.rsvps         enable row level security;
alter table public.points_ledger enable row level security;
alter table public.rewards       enable row level security;

-- ---- events ----
-- Anyone (even logged-out) can read published/completed events; admins read all.
drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events
  for select
  using (status in ('published','completed') or public.is_admin());

-- Only admins can create/update/delete events (and run check-in).
drop policy if exists events_admin_write on public.events;
create policy events_admin_write on public.events
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- members ----
drop policy if exists members_self_read on public.members;
create policy members_self_read on public.members
  for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists members_self_update on public.members;
create policy members_self_update on public.members
  for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---- rsvps ----
drop policy if exists rsvps_self_read on public.rsvps;
create policy rsvps_self_read on public.rsvps
  for select
  using (member_id = auth.uid() or public.is_admin());

drop policy if exists rsvps_self_insert on public.rsvps;
create policy rsvps_self_insert on public.rsvps
  for insert
  with check (member_id = auth.uid());

drop policy if exists rsvps_self_delete on public.rsvps;
create policy rsvps_self_delete on public.rsvps
  for delete
  using (member_id = auth.uid() or public.is_admin());

-- Admins update attendance at check-in.
drop policy if exists rsvps_admin_update on public.rsvps;
create policy rsvps_admin_update on public.rsvps
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---- points_ledger ----
drop policy if exists ledger_self_read on public.points_ledger;
create policy ledger_self_read on public.points_ledger
  for select
  using (member_id = auth.uid() or public.is_admin());

-- Ledger writes are server/admin-controlled (check-in, redemptions).
drop policy if exists ledger_admin_write on public.points_ledger;
create policy ledger_admin_write on public.points_ledger
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- rewards ----
drop policy if exists rewards_public_read on public.rewards;
create policy rewards_public_read on public.rewards
  for select
  using (true);

drop policy if exists rewards_admin_write on public.rewards;
create policy rewards_admin_write on public.rewards
  for all
  using (public.is_admin())
  with check (public.is_admin());
