import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleReader } from "@/components/journal/ArticleReader";
import { getCachedArticleBySlug, getPublishedArticles } from "@/lib/journal";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

// Only pre-render Japanese pages for articles that actually have Japanese text.
export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.filter((a) => a.title.jp && a.body.jp).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getCachedArticleBySlug(params.slug);
  if (!article) return { title: "ブログ — Borderless Kyoto" };
  const title = article.title.jp || article.title.en;
  const description = article.excerpt.jp || article.excerpt.en || undefined;
  const enPath = `/journal/${article.slug}`;
  const jaPath = `/ja/journal/${article.slug}`;
  const image = /^https?:\/\//.test(article.cover) ? article.cover : undefined;
  return {
    title: `${title} — Borderless Blog`,
    description,
    alternates: {
      canonical: jaPath,
      languages: { en: enPath, ja: jaPath, "x-default": enPath },
    },
    openGraph: {
      type: "article",
      url: jaPath,
      title,
      description,
      siteName: "Borderless",
      locale: "ja_JP",
      publishedTime: article.date,
      authors: article.authorName ? [article.authorName] : undefined,
      images: image ? [image] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default async function JaArticlePage({ params }: { params: { slug: string } }) {
  const article = await getCachedArticleBySlug(params.slug);
  if (!article) notFound();
  // No Japanese version → send them to the English article.
  if (!article.title.jp && !article.body.jp) notFound();

  const all = await getPublishedArticles();
  const more = all.filter((a) => a.id !== article.id).slice(0, 2);

  const image = /^https?:\/\//.test(article.cover) ? article.cover : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title.jp || article.title.en,
    description: article.excerpt.jp || article.excerpt.en || undefined,
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: "ja",
    author: { "@type": "Person", name: article.authorName || "Borderless" },
    image,
    mainEntityOfPage: `${SITE_URL}/ja/journal/${article.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Borderless",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-192.png` },
    },
  };

  return (
    <main className="stage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleReader article={article} more={more} pageLang="jp" enPath={`/journal/${article.slug}`} jaPath={`/ja/journal/${article.slug}`} />
    </main>
  );
}
