-- ============================================================
-- Borderless — org Discord profile link on the homepage
-- Run once in the Supabase SQL Editor.
-- ============================================================
alter table public.settings add column if not exists discord_url text;
