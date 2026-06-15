-- Editable rank (tier) point thresholds, stored on the single settings row.
-- Guest is always 0; only Regular and Insider are configurable in the admin
-- dashboard. NULL means "use the app default" (5 / 15).
alter table public.settings add column if not exists tier_regular_min integer;
alter table public.settings add column if not exists tier_insider_min integer;
