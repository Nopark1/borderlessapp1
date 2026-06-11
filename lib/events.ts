/* Event data access. Reads live from Supabase when configured; otherwise
   falls back to the hard-coded seed data (so Phase 1 visuals keep working
   before the database is connected). */

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Event, Category, EventStatus, EventInput } from "./types";
import { events as seedEvents } from "./data";
import { getSupabase } from "./supabase";
import { slugify } from "./recurrence";

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

/** All events (every status), newest first — for the admin events tab. */
export async function getAdminEvents(supabase: SupabaseClient): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });
    if (error || !data) {
      if (error) console.error("[getAdminEvents] read failed:", error.message);
      return [];
    }
    return (data as EventRow[]).map(fromRow);
  } catch (e) {
    console.error("[getAdminEvents] unreachable:", (e as Error).message);
    return [];
  }
}

/** Build the INSERT row for a new event from studio input. */
export function buildInsertRow(input: EventInput, status: EventStatus, date: string, suffix = "") {
  const base = input.slug || slugify(input.titleEn);
  return {
    slug: base + suffix,
    cover: input.cover,
    category: input.category,
    title_en: input.titleEn || "Untitled event",
    title_jp: input.titleJp || input.titleEn || "無題のイベント",
    date,
    time: input.time,
    end_time: input.endTime,
    venue_en: input.venueEn || "TBA",
    venue_jp: input.venueJp || input.venueEn || "未定",
    area_en: input.areaEn || "Kyoto",
    area_jp: input.areaJp || input.areaEn || "京都",
    price: Number(input.price) || 0,
    capacity: Number(input.capacity) || 0,
    cost: Number(input.cost) || 0,
    blurb_en: (input.descEn || "").slice(0, 90) || input.titleEn || "",
    blurb_jp: (input.descJp || "").slice(0, 60) || input.titleJp || "",
    desc_en: input.descEn || "",
    desc_jp: input.descJp || "",
    lat: 35.0036,
    lng: 135.77,
    invited: Number(input.invited) || 0,
    rsvp: 0,
    attended: null as number | null,
    gallery: 0,
    status,
  };
}

/** Build the UPDATE patch when editing (preserves rsvp/attended/gallery). */
export function buildUpdateRow(input: EventInput, status: EventStatus) {
  return {
    cover: input.cover,
    category: input.category,
    title_en: input.titleEn || "Untitled event",
    title_jp: input.titleJp || input.titleEn || "無題のイベント",
    date: input.date,
    time: input.time,
    end_time: input.endTime,
    venue_en: input.venueEn || "TBA",
    venue_jp: input.venueJp || input.venueEn || "未定",
    area_en: input.areaEn || "Kyoto",
    area_jp: input.areaJp || input.areaEn || "京都",
    price: Number(input.price) || 0,
    capacity: Number(input.capacity) || 0,
    cost: Number(input.cost) || 0,
    blurb_en: (input.descEn || "").slice(0, 90) || input.titleEn || "",
    blurb_jp: (input.descJp || "").slice(0, 60) || input.titleJp || "",
    desc_en: input.descEn || "",
    desc_jp: input.descJp || "",
    invited: Number(input.invited) || 0,
    status,
  };
}
