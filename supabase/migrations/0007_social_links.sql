-- ============================================================
-- Borderless — org social profile links (LINE + Instagram) on the homepage
-- Run once in the Supabase SQL Editor.
-- ============================================================
alter table public.settings add column if not exists line_url text;
alter table public.settings add column if not exists instagram_url text;
