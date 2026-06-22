import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Whether the current viewer has RSVP'd to an event. Lets the statically
// rendered event page resolve its RSVP button after load.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  const supabase = createClient();
  if (!supabase || !eventId) return NextResponse.json({ signedIn: false, joined: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ signedIn: false, joined: false });

  const { data: rsvp } = await supabase
    .from("rsvps")
    .select("id")
    .eq("event_id", eventId)
    .eq("member_id", user.id)
    .maybeSingle();
  return NextResponse.json({ signedIn: true, joined: Boolean(rsvp) });
}
