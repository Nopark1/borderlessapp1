import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleReader } from "@/components/journal/ArticleReader";
import { getCachedArticleBySlug, getPublishedArticles } from "@/lib/journal";

export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getCachedArticleBySlug(params.slug);
  if (!article) return { title: "Journal — Borderless Kyoto" };
  return {
    title: `${article.title.en || article.title.jp} — Borderless Journal`,
    description: article.excerpt.en || article.excerpt.jp || undefined,
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getCachedArticleBySlug(params.slug);
  if (!article) notFound();

  const all = await getPublishedArticles();
  const more = all.filter((a) => a.id !== article.id).slice(0, 2);

  return (
    <main className="stage">
      <ArticleReader article={article} more={more} />
    </main>
  );
}
