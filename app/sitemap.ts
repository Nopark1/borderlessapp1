import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/journal";
import { getPublicEvents } from "@/lib/events";
import { SITE_URL } from "@/lib/site";

// Regenerated hourly so new articles/events show up for crawlers automatically.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, events] = await Promise.all([getPublishedArticles(), getPublicEvents()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/journal`, changeFrequency: "daily", priority: 0.8 },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/journal/${a.slug}`,
    lastModified: new Date(`${a.date}T00:00:00Z`),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const eventPages: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${SITE_URL}/events/${e.slug}`,
    lastModified: new Date(`${e.date}T00:00:00Z`),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...articlePages, ...eventPages];
}
