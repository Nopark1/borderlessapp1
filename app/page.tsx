import { PublicSite } from "@/components/PublicSite";
import { getPublicEvents } from "@/lib/events";
import { getCachedSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createClient();

  // Header buttons only — cookie read, no auth network round-trip. An is_admin
  // lookup runs only for signed-in users (logged-out keeps the cached fast path).
  let signedIn = false;
  let isAdmin = false;
  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      signedIn = true;
      const { data: m } = await supabase
        .from("members")
        .select("is_admin")
        .eq("id", session.user.id)
        .maybeSingle();
      isAdmin = Boolean(m?.is_admin);
    }
  }

  // events + hero are both cached, so a typical load makes no DB query here.
  const [events, settings] = await Promise.all([getPublicEvents(), getCachedSettings()]);
  return (
    <main className="stage">
      <PublicSite
        initialEvents={events}
        signedIn={signedIn}
        isAdmin={isAdmin}
        heroImageUrl={settings.heroImageUrl}
        lineUrl={settings.lineUrl}
        instagramUrl={settings.instagramUrl}
        discordUrl={settings.discordUrl}
      />
    </main>
  );
}
