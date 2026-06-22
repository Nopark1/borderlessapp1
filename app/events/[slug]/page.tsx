import { notFound } from "next/navigation";
import { EventDetail } from "@/components/EventDetail";
import { getCachedEventBySlug, getPublicEvents } from "@/lib/events";

// Static / ISR: event pages are public, shareable, and rarely change — serve
// them as CDN-cached HTML. The viewer's RSVP state is resolved client-side in
// EventDetail. Admin edits and RSVPs purge this via revalidateTag("events").
export const revalidate = 60;

/** Pre-render every current event at build for instant first loads; new slugs
 *  render on demand and are then cached. */
export async function generateStaticParams() {
  const events = await getPublicEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export default async function EventPage({ params }: { params: { slug: string } }) {
  const event = await getCachedEventBySlug(params.slug);
  if (!event) notFound();

  return (
    <main className="stage">
      <EventDetail event={event} />
    </main>
  );
}
