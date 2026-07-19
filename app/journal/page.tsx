import { JournalList } from "@/components/journal/JournalList";
import { getPublishedArticles } from "@/lib/journal";

// Static / ISR — public reading page, CDN-cached; admin saves purge it via
// revalidateTag("articles").
export const revalidate = 60;

export const metadata = {
  title: "Journal — Borderless Kyoto",
  description: "Field notes on living, working & building a life in Japan — from the Borderless circle in Kyoto.",
};

export default async function JournalPage() {
  const articles = await getPublishedArticles();
  return (
    <main className="stage">
      <JournalList articles={articles} />
    </main>
  );
}
