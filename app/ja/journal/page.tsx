import { JournalList } from "@/components/journal/JournalList";
import { getPublishedArticles } from "@/lib/journal";

export const revalidate = 60;

const DESC = "日本で暮らし、働き、人生を築くための現場ノート。京都のボーダレスから。";

export const metadata = {
  title: "ブログ — Borderless Kyoto",
  description: DESC,
  alternates: {
    canonical: "/ja/journal",
    languages: { en: "/journal", ja: "/ja/journal", "x-default": "/journal" },
  },
  openGraph: {
    type: "website",
    url: "/ja/journal",
    title: "ブログ — Borderless Kyoto",
    description: DESC,
    siteName: "Borderless",
    locale: "ja_JP",
  },
};

export default async function JaJournalPage() {
  const articles = await getPublishedArticles();
  return (
    <main className="stage">
      <JournalList articles={articles} pageLang="jp" />
    </main>
  );
}
