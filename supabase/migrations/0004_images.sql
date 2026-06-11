-- ============================================================
-- Borderless — image uploads (Supabase Storage) + site settings
-- Lets admins upload a homepage hero image and per-event photos.
-- Run once in the Supabase SQL Editor.
-- ============================================================

-- Public bucket for uploaded images (hero + event covers).
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- Anyone can read; only admins can upload/change/remove.
drop policy if exists "images public read" on storage.objects;
create policy "images public read" on storage.objects
  for select using (bucket_id = 'images');

drop policy if exists "images admin insert" on storage.objects;
create policy "images admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and public.is_admin());

drop policy if exists "images admin update" on storage.objects;
create policy "images admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'images' and public.is_admin());

drop policy if exists "images admin delete" on storage.objects;
create policy "images admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'images' and public.is_admin());

-- ---- site settings (single row) ----
create table if not exists public.settings (
  id             int primary key default 1 check (id = 1),
  hero_image_url text,
  updated_at     timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

alter table public.settings enable row level security;

drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings
  for select using (true);

drop policy if exists settings_admin_write on public.settings;
create policy settings_admin_write on public.settings
  for all using (public.is_admin()) with check (public.is_admin());
