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
  rsvp?: number; // current RSVP count (online sign-ups + known)
  attended?: number | null; // total headcount; null until checked-in
  paidAttended?: number | null; // paying attendees (non-admin members + guests)
  guestCount?: number; // anonymous walk-ins (no account)
  status?: EventStatus;
  gallery?: number;
  knownRsvp?: number; // admin-set in-person RSVPs, added to the displayed count
  lineUrl?: string; // LINE group chat invite link for this event
  formUrl?: string; // external sign-up form (e.g. Google Forms) for this event
  mapsUrl?: string; // Google Maps link for this event's location
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
  attended?: number | null; // actual headcount, editable for past events
  knownRsvp?: number; // in-person/known RSVPs to add to the displayed count
  lineUrl?: string; // LINE group chat invite link
  formUrl?: string; // external sign-up form (e.g. Google Forms)
  mapsUrl?: string; // Google Maps link for the location
};

export type RepeatFreq = "none" | "weekly" | "biweekly" | "monthly";
export type Recurrence = { freq: RepeatFreq; count: number };

export type SaveResult = { ok?: true; error?: string; count?: number };

/* ---- Journal (blog) ---- */
export type BlogCategory = "living" | "jobs" | "industry";
export type BlogCatMeta = { en: string; jp: string; short: Bilingual; color: string; soft: string; emoji: string };

/** A file attached to an article (image, PDF, doc, …). */
export type Attachment = { url: string; name: string; type: string };

export type Article = {
  id: string;
  slug: string;
  cover: string;
  category: BlogCategory;
  authorId: string | null; // an admin member id (may be null for seed/legacy)
  authorName: string; // snapshot, shown publicly without exposing members
  authorRole: string; // optional byline role, e.g. "Editor"
  date: string; // YYYY-MM-DD
  readMin: number;
  status: "draft" | "published";
  title: Bilingual;
  excerpt: Bilingual;
  body: Bilingual;
  attachments: Attachment[];
};

/** What the admin article studio collects. Maps to the articles table on save. */
export type ArticleInput = {
  id?: string;
  slug?: string;
  cover: string;
  category: BlogCategory;
  authorId: string | null;
  authorName: string;
  authorRole: string;
  readMin: number;
  status: "draft" | "published";
  titleEn: string;
  titleJp: string;
  excerptEn: string;
  excerptJp: string;
  bodyEn: string;
  bodyJp: string;
  attachments: Attachment[];
};

/** An admin account offered as an author in the studio dropdown. */
export type AdminAuthor = { id: string; name: string };

/** Aggregated per-article analytics (non-admin traffic only). */
export type ArticleStat = {
  views: number;
  impressions: number;
  ctr: number; // views / impressions (0–1+)
  avgMs: number; // average time on page, milliseconds
  readers: number; // distinct anonymous sessions that viewed
};
