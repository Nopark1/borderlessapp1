"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export type RsvpResult = { ok?: true; joined?: boolean; error?: string; needsLogin?: boolean };

/** Toggle the current member's RSVP for an event. */
export async function toggleRsvp(eventId: string, slug: string): Promise<RsvpResult> {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase isn't connected yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { needsLogin: true, error: "Please sign in to RSVP." };

  try {
    const { data: existing } = await supabase
      .from("rsvps")
      .select("id")
      .eq("event_id", eventId)
      .eq("member_id", user.id)
      .maybeSingle();

    let joined: boolean;
    if (existing) {
      const { error } = await supabase.from("rsvps").delete().eq("id", existing.id);
      if (error) return { error: error.message };
      joined = false;
    } else {
      const { error } = await supabase
        .from("rsvps")
        .insert({ event_id: eventId, member_id: user.id });
      if (error) return { error: error.message };
      joined = true;
    }

    revalidatePath(`/events/${slug}`);
    revalidatePath("/");
    revalidatePath("/me");
    revalidateTag("events");
    return { ok: true, joined };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
