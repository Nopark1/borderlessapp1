import { PublicSite } from "@/components/PublicSite";
import { getPublicEvents } from "@/lib/events";
import { getCachedSettings } from "@/lib/settings";

// Statically rendered and revalidated — served as CDN-cached HTML. The
// per-user header buttons (My profile / Admin) are resolved client-side in
// PublicSite, and event/hero edits purge this via revalidatePath("/").
export const revalidate = 60;

export default async function Home() {
  // events + hero are both cached; a typical build/revalidate makes one
  // batch of reads and the rendered HTML is then reused for every visitor.
  const [events, settings] = await Promise.all([getPublicEvents(), getCachedSettings()]);
  return (
    <main className="stage">
      <PublicSite
        initialEvents={events}
        heroImageUrl={settings.heroImageUrl}
        lineUrl={settings.lineUrl}
        instagramUrl={settings.instagramUrl}
        discordUrl={settings.discordUrl}
      />
    </main>
  );
}
