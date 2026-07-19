-- ============================================================
-- Borderless — article attachments (images, PDFs, other files)
-- Run once in the Supabase SQL Editor.
-- Files are uploaded to the existing public "images" storage bucket; this
-- column stores the list of { url, name, type }.
-- ============================================================
alter table public.articles add column if not exists attachments jsonb not null default '[]'::jsonb;
