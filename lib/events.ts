/* Event data access. Reads live from Supabase when configured; otherwise
   falls back to the hard-coded seed data (so Phase 1 visuals keep working
   before the database is connected). */

import "server-only";
import type { Event, Category, EventStatus } from "./types";
import { events as seedEvents } from "./data";
import { getSupabase } from "./supabase";

/** Shape of a row from the `events` table (flat bilingual columns, README §2). */
type EventRow = {
  id: string;
  slug: string;
  cover: string | null;
  category: Category;
  title_en: string;
  title_jp: string;
  date: string;
  time: string | null;
  end_time: string | null;
  venue_en: string | null;
  venue_jp: string | null;
  area_en: string | null;
  area_jp: string | null;
  price: number;
  capacity: number;
  cost: number;
  blurb_en: string | null;
  blurb_jp: string | null;
  desc_en: string | null;
  desc_jp: string | null;
  lat: number | null;
  lng: number | null;
  invited: number;
  rsvp: number;
  attended: number | null;
  gallery: number;
  status: EventStatus;
};

/** Map a flat DB row to the app's nested bilingual Event shape. */
export function fromRow(r: EventRow): Event {
  return {
    id: r.id,
    slug: r.slug,
    cover: r.cover ?? "lantern",
    category: r.category,
    title: { en: r.title_en, jp: r.title_jp },
    date: r.date,
    time: r.time ?? "",
    endTime: r.end_time ?? "",
    venue: { en: r.venue_en ?? "", jp: r.venue_jp ?? "" },
    area: { en: r.area_en ?? "", jp: r.area_jp ?? "" },
    price: r.price,
    capacity: r.capacity,
    cost: r.cost,
    blurb: { en: r.blurb_en ?? "", jp: r.blurb_jp ?? "" },
    desc: { en: r.desc_en ?? "", jp: r.desc_jp ?? "" },
    lat: r.lat ?? 0,
    lng: r.lng ?? 0,
    invited: r.invited,
    rsvp: r.rsvp,
    attended: r.attended,
    gallery: r.gallery,
    status: r.status,
  };
}

/** Events visible on the public site: published + completed, soonest first. */
export async function getPublicEvents(): Promise<Event[]> {
  const sb = getSupabase();
  if (!sb) return seedEvents; // not connected yet — use seed data

  try {
    const { data, error } = await sb
      .from("events")
      .select("*")
      .in("status", ["published", "completed"])
      .order("date", { ascending: true });

    if (error) {
      console.error("[getPublicEvents] Supabase read failed, using seed data:", error.message);
      return seedEvents;
    }
    return (data as EventRow[]).map(fromRow);
  } catch (e) {
    // Network unreachable (e.g. host blocked / offline) — degrade gracefully.
    console.error("[getPublicEvents] Supabase unreachable, using seed data:", (e as Error).message);
    return seedEvents;
  }
}
