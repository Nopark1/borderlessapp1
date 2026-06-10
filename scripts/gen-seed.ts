/* Generates supabase/seed.sql from lib/data.ts (the single source of truth),
   so the database seed never drifts from the app's seed data.

   Run:  npm run gen:seed     (uses Node's built-in TypeScript stripping)
   This regenerates supabase/seed.sql; commit the result.

   Note: event `id`s are left to the database (gen_random_uuid()); `slug` is the
   stable unique key. Re-running the seed is safe (ON CONFLICT DO NOTHING). */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { events, rewards } from "../lib/data.ts";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "supabase", "seed.sql");

// SQL literal: NULL, numbers raw, strings single-quoted with '' escaping.
function lit(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  return "'" + v.replace(/'/g, "''") + "'";
}

const eventCols = [
  "slug", "cover", "category", "title_en", "title_jp", "date", "time", "end_time",
  "venue_en", "venue_jp", "area_en", "area_jp", "price", "capacity", "cost",
  "blurb_en", "blurb_jp", "desc_en", "desc_jp", "lat", "lng",
  "invited", "rsvp", "attended", "gallery", "status",
];

const eventRows = events.map((e) => {
  const vals = [
    e.slug, e.cover, e.category, e.title.en, e.title.jp, e.date, e.time, e.endTime,
    e.venue.en, e.venue.jp, e.area.en, e.area.jp, e.price, e.capacity, e.cost ?? 0,
    e.blurb.en, e.blurb.jp, e.desc.en, e.desc.jp, e.lat, e.lng,
    e.invited, e.rsvp ?? 0, e.attended ?? null, e.gallery ?? 0, e.status ?? "draft",
  ];
  return "  (" + vals.map(lit).join(", ") + ")";
});

const rewardCols = ["id", "title_en", "title_jp", "cost", "tag"];
const rewardRows = rewards.map((r) => {
  const vals = [r.id, r.title.en, r.title.jp, r.cost, r.tag ?? null];
  return "  (" + vals.map(lit).join(", ") + ")";
});

const sql = `-- ============================================================
-- Borderless — seed data (GENERATED from lib/data.ts)
-- Do not edit by hand; run "npm run gen:seed" instead.
-- Safe to re-run: ON CONFLICT DO NOTHING.
-- ============================================================

insert into public.events
  (${eventCols.join(", ")})
values
${eventRows.join(",\n")}
on conflict (slug) do nothing;

insert into public.rewards
  (${rewardCols.join(", ")})
values
${rewardRows.join(",\n")}
on conflict (id) do nothing;
`;

writeFileSync(out, sql, "utf8");
console.log(`Wrote ${out} (${events.length} events, ${rewards.length} rewards)`);
