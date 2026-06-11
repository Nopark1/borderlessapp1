import { notFound } from "next/navigation";
import { EventDetail } from "@/components/EventDetail";
import { getEventBySlug } from "@/lib/events";
import { createClient } from "@/lib/supabase-server";
import { events as seedEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  let event = supabase ? await getEventBySlug(supabase, params.slug) : null;
  let signedIn = false;
  let joined = false;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
    if (user && event) {
      const { data: rsvp } = await supabase
        .from("rsvps")
        .select("id")
        .eq("event_id", event.id)
        .eq("member_id", user.id)
        .maybeSingle();
      joined = Boolean(rsvp);
    }
  }

  // fallback to seed data when Supabase isn't connected (keeps the page working)
  if (!event) {
    event = seedEvents.find((e) => e.slug === params.slug) ?? null;
  }
  if (!event) notFound();

  return (
    <main className="stage">
      <EventDetail event={event} signedIn={signedIn} initialJoined={joined} />
    </main>
  );
}
