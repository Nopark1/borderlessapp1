import { PublicSite } from "@/components/PublicSite";
import { getPublicEvents } from "@/lib/events";
import { getSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase-server";

// Always read fresh from the database (no static caching of the feed).
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createClient();
  let signedIn = false;
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
  }

  const [events, settings] = await Promise.all([getPublicEvents(), getSettings(supabase)]);
  return (
    <main className="stage">
      <PublicSite initialEvents={events} signedIn={signedIn} heroImageUrl={settings.heroImageUrl} />
    </main>
  );
}
