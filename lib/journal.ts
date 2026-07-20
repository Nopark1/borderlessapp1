/* Journal (blog) data access. Reads live from Supabase when configured;
   otherwise falls back to seed articles so the UI keeps working before the
   database is connected. Public reads are cached and tagged "articles". */

import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Article, ArticleInput, AdminAuthor, ArticleStat, BlogCategory, Attachment } from "./types";
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

/** Aggregated analytics per article slug (non-admin events only). Best-effort:
 *  returns {} if the events table doesn't exist yet. */
export async function getArticleStats(supabase: SupabaseClient): Promise<Record<string, ArticleStat>> {
  try {
    const { data } = await supabase.from("article_events").select("slug, type, ms, session");
    const rows = (data ?? []) as { slug: string; type: string; ms: number | null; session: string | null }[];
    const acc: Record<string, { views: number; impressions: number; dwellSum: number; dwellN: number; sessions: Set<string> }> = {};
    for (const r of rows) {
      let a = acc[r.slug];
      if (!a) { a = { views: 0, impressions: 0, dwellSum: 0, dwellN: 0, sessions: new Set() }; acc[r.slug] = a; }
      if (r.type === "view") { a.views++; if (r.session) a.sessions.add(r.session); }
      else if (r.type === "impression") a.impressions++;
      else if (r.type === "dwell" && r.ms) { a.dwellSum += r.ms; a.dwellN++; }
    }
    const out: Record<string, ArticleStat> = {};
    for (const slug of Object.keys(acc)) {
      const a = acc[slug];
      out[slug] = {
        views: a.views,
        impressions: a.impressions,
        ctr: a.impressions ? a.views / a.impressions : 0,
        avgMs: a.dwellN ? Math.round(a.dwellSum / a.dwellN) : 0,
        readers: a.sessions.size,
      };
    }
    return out;
  } catch {
    return {};
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
