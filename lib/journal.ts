/* Journal (blog) data access. Reads live from Supabase when configured;
   otherwise falls back to seed articles so the UI keeps working before the
   database is connected. Public reads are cached and tagged "articles". */

import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Article, ArticleInput, AdminAuthor, ArticleStat, BlogAnalytics, BlogCategory, Attachment, NameCount } from "./types";
import { seedArticles } from "./data";
import { getSupabase } from "./supabase";
import { slugify } from "./recurrence";

export type ArticleRow = {
  id: string;
  slug: string;
  cover: string | null;
  category: string;
  author_id: string | null;
  author_name: string | null;
  author_role: string | null;
  date: string;
  read_min: number | null;
  status: string;
  title_en: string | null;
  title_jp: string | null;
  excerpt_en: string | null;
  excerpt_jp: string | null;
  body_en: string | null;
  body_jp: string | null;
  attachments?: unknown;
};

function normAttachments(v: unknown): Attachment[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is Record<string, unknown> => !!x && typeof x === "object" && typeof (x as Record<string, unknown>).url === "string")
    .map((x) => ({ url: String(x.url), name: String(x.name ?? "file"), type: String(x.type ?? "") }));
}

export function fromArticleRow(r: ArticleRow): Article {
  return {
    id: r.id,
    slug: r.slug,
    cover: r.cover ?? "lantern",
    category: (r.category as BlogCategory) ?? "living",
    authorId: r.author_id ?? null,
    authorName: r.author_name ?? "Borderless",
    authorRole: r.author_role ?? "",
    date: r.date,
    readMin: r.read_min ?? 5,
    status: r.status === "published" ? "published" : "draft",
    title: { en: r.title_en ?? "", jp: r.title_jp ?? "" },
    excerpt: { en: r.excerpt_en ?? "", jp: r.excerpt_jp ?? "" },
    body: { en: r.body_en ?? "", jp: r.body_jp ?? "" },
    attachments: normAttachments(r.attachments),
  };
}

// select * so a not-yet-migrated column (e.g. attachments) never errors the read
const ARTICLE_COLS = "*";

/** Published articles for the public Journal, newest first. Cached 60s,
 *  tagged "articles" (invalidated when an admin saves/deletes). */
export const getPublishedArticles = unstable_cache(
  async (): Promise<Article[]> => {
    const sb = getSupabase();
    if (!sb) return seedArticles.filter((a) => a.status === "published");
    try {
      const { data, error } = await sb
        .from("articles")
        .select(ARTICLE_COLS)
        .eq("status", "published")
        .order("date", { ascending: false });
      if (error) return seedArticles.filter((a) => a.status === "published");
      return (data as ArticleRow[]).map(fromArticleRow);
    } catch {
      return seedArticles.filter((a) => a.status === "published");
    }
  },
  ["published-articles"],
  { revalidate: 60, tags: ["articles"] }
);

/** A single published article by slug (public), or null. Cached, tagged "articles". */
export const getCachedArticleBySlug = (slug: string): Promise<Article | null> =>
  unstable_cache(
    async (): Promise<Article | null> => {
      const sb = getSupabase();
      if (!sb) return seedArticles.find((a) => a.slug === slug && a.status === "published") ?? null;
      try {
        const { data, error } = await sb
          .from("articles")
          .select(ARTICLE_COLS)
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle();
        if (error) return seedArticles.find((a) => a.slug === slug && a.status === "published") ?? null;
        if (!data) return null;
        return fromArticleRow(data as ArticleRow);
      } catch {
        return seedArticles.find((a) => a.slug === slug && a.status === "published") ?? null;
      }
    },
    ["article-by-slug", slug],
    { revalidate: 60, tags: ["articles"] }
  )();

/** All articles (every status), newest first — for the admin Journal tab. */
export async function getAdminArticles(supabase: SupabaseClient): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_COLS)
      .order("date", { ascending: false });
    if (error || !data) return seedArticles;
    return (data as ArticleRow[]).map(fromArticleRow);
  } catch {
    return seedArticles;
  }
}

/** Admin accounts offered as authors in the studio dropdown. */
export async function getAdminAuthors(supabase: SupabaseClient): Promise<AdminAuthor[]> {
  try {
    const { data } = await supabase.from("members").select("id, name").eq("is_admin", true);
    const rows = (data ?? []) as { id: string; name: string | null }[];
    return rows
      .map((m) => ({ id: m.id, name: m.name || "Admin" }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

const QUICK_EXIT_MS = 10_000;

type EventRow = {
  slug: string;
  type: string;
  ms: number | null;
  session: string | null;
  source: string | null;
  lang: string | null;
  device: string | null;
  created_at: string | null;
};

function topN(map: Record<string, number>, n: number): NameCount[] {
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/** Per-article stats + a blog-wide overview, computed from one events read
 *  (non-admin only). Best-effort: empty results if the table isn't migrated. */
export async function getBlogStats(
  supabase: SupabaseClient,
  categoryBySlug: Record<string, string>
): Promise<{ perArticle: Record<string, ArticleStat>; overview: BlogAnalytics }> {
  const emptyOverview: BlogAnalytics = {
    totalViews: 0, readers: 0, newReaders: 0, returningReaders: 0, avgMs: 0, completionRate: 0,
    device: { mobile: 0, desktop: 0, tablet: 0 }, topSources: [], byTopic: [], trend: [],
  };
  try {
    const { data } = await supabase.from("article_events").select("*");
    const rows = (data ?? []) as EventRow[];

    const now = Date.now();
    const weekAgo = now - 7 * 864e5;
    const dayKey = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

    type Acc = {
      views: number; impressions: number; dwellSum: number; dwellN: number; quickExits: number;
      completions: number; shares: number; downloads: number; readNext: number; cta: number; viewsWeek: number;
      sessions: Set<string>; lang: { en: number; jp: number }; device: { mobile: number; desktop: number; tablet: number };
      sources: Record<string, number>;
    };
    const mk = (): Acc => ({
      views: 0, impressions: 0, dwellSum: 0, dwellN: 0, quickExits: 0,
      completions: 0, shares: 0, downloads: 0, readNext: 0, cta: 0, viewsWeek: 0,
      sessions: new Set(), lang: { en: 0, jp: 0 }, device: { mobile: 0, desktop: 0, tablet: 0 }, sources: {},
    });
    const per: Record<string, Acc> = {};

    // blog-wide accumulators
    let gViews = 0, gDwellSum = 0, gDwellN = 0, gCompletions = 0;
    const gDevice = { mobile: 0, desktop: 0, tablet: 0 };
    const gSources: Record<string, number> = {};
    const gTopic: Record<string, number> = {};
    const gTrend: Record<string, number> = {};
    const sessionDays: Record<string, Set<string>> = {}; // session → distinct view-days (new vs returning)

    for (const r of rows) {
      let a = per[r.slug];
      if (!a) { a = mk(); per[r.slug] = a; }
      const t = new Date(r.created_at || 0).getTime();
      if (r.type === "view") {
        a.views++; gViews++;
        if (r.session) { a.sessions.add(r.session); (sessionDays[r.session] ||= new Set()).add(dayKey(r.created_at)); }
        if (t >= weekAgo) a.viewsWeek++;
        if (r.lang === "jp") a.lang.jp++; else a.lang.en++;
        const dev = r.device === "mobile" ? "mobile" : r.device === "tablet" ? "tablet" : "desktop";
        a.device[dev]++; gDevice[dev]++;
        const src = r.source || "direct";
        a.sources[src] = (a.sources[src] || 0) + 1;
        gSources[src] = (gSources[src] || 0) + 1;
        const cat = categoryBySlug[r.slug];
        if (cat) gTopic[cat] = (gTopic[cat] || 0) + 1;
        const dk = dayKey(r.created_at);
        if (dk) gTrend[dk] = (gTrend[dk] || 0) + 1;
      } else if (r.type === "impression") {
        a.impressions++;
      } else if (r.type === "dwell" && r.ms) {
        a.dwellSum += r.ms; a.dwellN++; gDwellSum += r.ms; gDwellN++;
        if (r.ms < QUICK_EXIT_MS) a.quickExits++;
      } else if (r.type === "complete") { a.completions++; gCompletions++; }
      else if (r.type === "share") a.shares++;
      else if (r.type === "download") a.downloads++;
      else if (r.type === "readnext") a.readNext++;
      else if (r.type === "cta") a.cta++;
    }

    const perArticle: Record<string, ArticleStat> = {};
    for (const slug of Object.keys(per)) {
      const a = per[slug];
      perArticle[slug] = {
        views: a.views,
        impressions: a.impressions,
        ctr: a.impressions ? a.views / a.impressions : 0,
        avgMs: a.dwellN ? Math.round(a.dwellSum / a.dwellN) : 0,
        readers: a.sessions.size,
        completions: a.completions,
        completionRate: a.views ? a.completions / a.views : 0,
        quickExits: a.quickExits,
        quickExitRate: a.dwellN ? a.quickExits / a.dwellN : 0,
        shares: a.shares,
        downloads: a.downloads,
        readNext: a.readNext,
        ctaClicks: a.cta,
        viewsWeek: a.viewsWeek,
        lang: a.lang,
        device: a.device,
        sources: topN(a.sources, 4),
      };
    }

    // new vs returning: a reader is "returning" if seen on 2+ distinct days
    let returning = 0;
    for (const s of Object.keys(sessionDays)) if (sessionDays[s].size >= 2) returning++;
    const readers = Object.keys(sessionDays).length;

    // 14-day trend series (fill gaps with 0)
    const trend: { day: string; views: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 864e5).toISOString().slice(0, 10);
      trend.push({ day: d, views: gTrend[d] || 0 });
    }

    const overview: BlogAnalytics = {
      totalViews: gViews,
      readers,
      newReaders: readers - returning,
      returningReaders: returning,
      avgMs: gDwellN ? Math.round(gDwellSum / gDwellN) : 0,
      completionRate: gViews ? gCompletions / gViews : 0,
      device: gDevice,
      topSources: topN(gSources, 6),
      byTopic: topN(gTopic, 5),
      trend,
    };

    return { perArticle, overview };
  } catch {
    return { perArticle: {}, overview: emptyOverview };
  }
}

/** Map studio input to an articles table row (author_id + name/role snapshot). */
export function buildArticleRow(input: ArticleInput) {
  return {
    slug: input.slug || slugify(input.titleEn || input.titleJp || "article"),
    cover: input.cover || "lantern",
    category: input.category,
    author_id: input.authorId || null,
    author_name: input.authorName || "Borderless",
    author_role: input.authorRole || null,
    read_min: Number(input.readMin) || 1,
    status: input.status,
    title_en: input.titleEn || null,
    title_jp: input.titleJp || null,
    excerpt_en: input.excerptEn || null,
    excerpt_jp: input.excerptJp || null,
    body_en: input.bodyEn || null,
    body_jp: input.bodyJp || null,
  };
}
