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

  // roster = members who RSVP'd; allMembers = everyone (for adding walk-ins)
  const [rsvpRes, memRes, ledRes] = await Promise.all([
    supabase.from("rsvps").select("member_id, attended, members(name, country, is_admin)").eq("event_id", params.id),
    supabase.from("members").select("id, name, country, is_admin"),
    supabase.from("points_ledger").select("member_id, points"),
  ]);

  const rosterRows = (rsvpRes.data ?? []) as unknown as Array<{
    member_id: string;
    attended: boolean;
    members: { name: string | null; country: string | null; is_admin: boolean | null } | null;
  }>;

  // points balance per member
  const points: Record<string, number> = {};
  for (const row of (ledRes.data ?? []) as { member_id: string; points: number }[]) {
    points[row.member_id] = (points[row.member_id] || 0) + row.points;
  }

  const roster: RosterMember[] = rosterRows.map((r) => ({
    id: r.member_id,
    name: r.members?.name || "Member",
    country: r.members?.country || "",
    points: points[r.member_id] || 0,
    attended: Boolean(r.attended),
    isAdmin: Boolean(r.members?.is_admin),
  }));

  // members who didn't RSVP — searchable to add as walk-ins
  const rosterIds = new Set(roster.map((m) => m.id));
  const addable: RosterMember[] = ((memRes.data ?? []) as { id: string; name: string | null; country: string | null; is_admin: boolean | null }[])
    .filter((m) => !rosterIds.has(m.id))
    .map((m) => ({ id: m.id, name: m.name || "Member", country: m.country || "", points: points[m.id] || 0, attended: false, isAdmin: Boolean(m.is_admin) }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return <CheckInScreen event={event} roster={roster} addable={addable} />;
}
