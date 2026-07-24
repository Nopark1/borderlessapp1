import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleReader } from "@/components/journal/ArticleReader";
import { getCachedArticleBySlug, getPublishedArticles } from "@/lib/journal";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getCachedArticleBySlug(params.slug);
  if (!article) return { title: "Blog — Borderless Kyoto" };
  const title = article.title.en || article.title.jp;
  const description = article.excerpt.en || article.excerpt.jp || undefined;
  const path = `/journal/${article.slug}`;
  const image = /^https?:\/\//.test(article.cover) ? article.cover : undefined;
  return {
    title: `${title} — Borderless Blog`,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title,
      description,
      siteName: "Borderless",
      publishedTime: article.date,
      authors: article.authorName ? [article.authorName] : undefined,
      images: image ? [image] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getCachedArticleBySlug(params.slug);
  if (!article) notFound();

  const all = await getPublishedArticles();
  const more = all.filter((a) => a.id !== article.id).slice(0, 2);

  const image = /^https?:\/\//.test(article.cover) ? article.cover : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title.en || article.title.jp,
    description: article.excerpt.en || article.excerpt.jp || undefined,
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: article.title.en ? "en" : "ja",
    author: { "@type": "Person", name: article.authorName || "Borderless" },
    image,
    mainEntityOfPage: `${SITE_URL}/journal/${article.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Borderless",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-192.png` },
    },
  };

  return (
    <main className="stage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArticleReader article={article} more={more} />
    </main>
  );
}
