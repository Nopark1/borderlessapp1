import { PublicSite } from "@/components/PublicSite";
import { getPublicEvents } from "@/lib/events";

// Always read fresh from the database (no static caching of the feed).
export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await getPublicEvents();
  return (
    <main className="stage">
      <PublicSite initialEvents={events} />
    </main>
  );
}
