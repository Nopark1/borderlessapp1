import { redirect } from "next/navigation";
import { CheckInScreen, type RosterMember } from "@/components/admin/CheckInScreen";
import { createClient } from "@/lib/supabase-server";
import { fromRow } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function CheckInPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!member?.is_admin) redirect("/me");

  const { data: ev } = await supabase.from("events").select("*").eq("id", params.id).maybeSingle();
  if (!ev) redirect("/admin");
  const event = fromRow(ev as Parameters<typeof fromRow>[0]);

  // roster = members who RSVP'd, with their attendance + points balance
  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("member_id, attended, members(name, country)")
    .eq("event_id", params.id);

  const rosterRows = (rsvps ?? []) as unknown as Array<{
    member_id: string;
    attended: boolean;
    members: { name: string | null; country: string | null } | null;
  }>;

  // points balance per roster member
  const ids = rosterRows.map((r) => r.member_id);
  const points: Record<string, number> = {};
  if (ids.length) {
    const { data: ledger } = await supabase
      .from("points_ledger")
      .select("member_id, points")
      .in("member_id", ids);
    for (const row of (ledger ?? []) as { member_id: string; points: number }[]) {
      points[row.member_id] = (points[row.member_id] || 0) + row.points;
    }
  }

  const roster: RosterMember[] = rosterRows.map((r) => ({
    id: r.member_id,
    name: r.members?.name || "Member",
    country: r.members?.country || "",
    points: points[r.member_id] || 0,
    attended: Boolean(r.attended),
  }));

  return <CheckInScreen event={event} roster={roster} />;
}
