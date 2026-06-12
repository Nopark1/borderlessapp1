-- ============================================================
-- Borderless — per-event LINE group chat link
-- Run once in the Supabase SQL Editor.
-- ============================================================
alter table public.events add column if not exists line_url text;
