/* Shared domain types for Borderless.
   Bilingual fields are kept as { en, jp } objects to match the prototype
   and the i18n helper. In Phase 2 these map to title_en/title_jp columns. */

export type Lang = "en" | "jp";

export type Bilingual = { en: string; jp: string };

export type CoverKey =
  | "matsuri"
  | "night"
  | "tea"
  | "river"
  | "food"
  | "lantern"
  | "sakura"
  | "zen";

export type Category =
  | "cultural"
  | "food"
  | "nightlife"
  | "outdoor"
  | "workshop"
  | "language";

export type EventStatus = "draft" | "published" | "completed";

export type Event = {
  id: string;
  slug: string;
  cover: CoverKey | string;
  category: Category;
  title: Bilingual;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  endTime: string; // HH:MM
  venue: Bilingual;
  area: Bilingual;
  price: number; // entry fee in yen
  capacity: number;
  cost?: number; // total event cost in yen (drives break-even)
  blurb: Bilingual;
  desc: Bilingual;
  lat: number;
  lng: number;
  invited: number;
  rsvp?: number; // current RSVP count
  attended?: number | null; // null until checked-in
  status?: EventStatus;
  gallery?: number;
};

export type CategoryMeta = { en: string; jp: string; color: string };

export type Tier = { key: string; min: number; jp: string; color: string };

export type Reward = {
  id: string;
  cost: number;
  title: Bilingual;
  tag?: "popular" | "limited";
};

/** What the admin event "studio" collects. Maps to the events table on save. */
export type EventInput = {
  id?: string; // present when editing
  slug?: string;
  cover: string;
  category: Category;
  titleEn: string;
  titleJp: string;
  date: string;
  time: string;
  endTime: string;
  venueEn: string;
  venueJp: string;
  areaEn: string;
  areaJp: string;
  price: number;
  capacity: number;
  cost: number;
  invited: number;
  descEn: string;
  descJp: string;
};

export type RepeatFreq = "none" | "weekly" | "biweekly" | "monthly";
export type Recurrence = { freq: RepeatFreq; count: number };

export type SaveResult = { ok?: true; error?: string; count?: number };
