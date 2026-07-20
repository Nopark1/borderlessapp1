-- ============================================================
-- Borderless — extra analytics dimensions on article_events
-- Adds traffic source, read language, and device to each event.
-- Run once in the Supabase SQL Editor (after 0015).
-- ============================================================
alter table public.article_events add column if not exists source text;
alter table public.article_events add column if not exists lang text;
alter table public.article_events add column if not exists device text;
