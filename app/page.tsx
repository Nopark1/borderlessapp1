import { PublicSite } from "@/components/PublicSite";
import { getPublicEvents } from "@/lib/events";
import { getCachedSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createClient();

  // Header button only (My profile vs Sign in) — a cookie read, no auth network
  // round-trip. Anything security-sensitive (e.g. /me) still verifies with getUser.
  let signedIn = false;
  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    signedIn = Boolean(session);
  }

  // events + hero are both cached, so a typical load makes no DB query here.
  const [events, settings] = await Promise.all([getPublicEvents(), getCachedSettings()]);
  return (
    <main className="stage">
      <PublicSite initialEvents={events} signedIn={signedIn} heroImageUrl={settings.heroImageUrl} />
    </main>
  );
}
