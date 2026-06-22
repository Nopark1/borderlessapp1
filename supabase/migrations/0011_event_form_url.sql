-- ============================================================
-- Borderless — per-event external sign-up form link (e.g. Google Forms)
-- Run once in the Supabase SQL Editor.
-- ============================================================
alter table public.events add column if not exists form_url text;
