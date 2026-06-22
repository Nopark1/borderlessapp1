-- ============================================================
-- Borderless — per-event Google Maps link for the location
-- Run once in the Supabase SQL Editor.
-- ============================================================
alter table public.events add column if not exists maps_url text;
