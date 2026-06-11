/* Member dashboard data: assembled from the database for the logged-in user.
   - points balance = SUM(points_ledger.points)
   - tier derived from points; streak from attendance history
   All derived live (never stored stale), per README §3/§4. */

import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Event, Reward, Tier } from "./types";
import { tiers, rewards as seedRewards } from "./data";
import { tierFor, pointsFor, isPast } from "./formulas";
import { fromRow } from "./events";

export type HistoryRow = { event: Event; went: boolean; points: number };

export type DashboardData = {
  name: string;
  handle: string;
  joined: string;
  isAdmin: boolean;
  points: number;
  tier: Tier;
  nextTier: Tier | null;
  progress: number; // 0–100 toward next tier
  ptsToNext: number;
  attended: number;
  showRate: number;
  streak: number;
  inviteCode: string;
  upcoming: Event[];
  history: HistoryRow[];
  rewards: Reward[];
};

function inviteCodeFrom(handle: string, name: string): string {
  const base = (handle || name || "you").replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "YOU";
  return `${base}-KYOTO`;
}

export async function getMemberDashboard(
  supabase: SupabaseClient,
  user: User
): Promise<DashboardData> {
  const fallbackName = user.email?.split("@")[0] ?? "Member";

  // Defaults (used if a query fails or there's simply no data yet).
  let name = (user.user_metadata?.name as string) || fallbackName;
  let handle = "";
  let joined = new Date().toISOString().slice(0, 10);
  let isAdmin = false;
  let points = 0;
  let upcoming: Event[] = [];
  let history: HistoryRow[] = [];
  let rewards: Reward[] = seedRewards;

  try {
    // --- member profile ---
    const { data: member } = await supabase
      .from("members")
      .select("name, handle, joined, is_admin")
      .eq("id", user.id)
      .maybeSingle();
    if (member) {
      name = member.name || name;
      handle = member.handle || "";
      joined = member.joined || joined;
      isAdmin = Boolean(member.is_admin);
    }

    // --- points balance = SUM(points_ledger.points) ---
    const { data: ledger } = await supabase
      .from("points_ledger")
      .select("points")
      .eq("member_id", user.id);
    if (ledger) points = ledger.reduce((s, r) => s + (r.points as number), 0);

    // --- RSVPs joined with events → upcoming + history ---
    const { data: rsvps } = await supabase
      .from("rsvps")
      .select("attended, events(*)")
      .eq("member_id", user.id);
    if (rsvps) {
      for (const r of rsvps as Array<{ attended: boolean; events: unknown }>) {
        if (!r.events) continue;
        const ev = fromRow(r.events as Parameters<typeof fromRow>[0]);
        if (isPast(ev)) {
          history.push({ event: ev, went: Boolean(r.attended), points: pointsFor(ev) });
        } else if (ev.status === "published") {
          upcoming.push(ev);
        }
      }
      upcoming.sort((a, b) => (a.date < b.date ? -1 : 1));
      history.sort((a, b) => (a.event.date < b.event.date ? 1 : -1)); // newest first
    }

    // --- rewards catalog ---
    const { data: rw } = await supabase
      .from("rewards")
      .select("id, title_en, title_jp, cost, tag")
      .order("cost", { ascending: true });
    if (rw && rw.length) {
      rewards = rw.map((r) => ({
        id: r.id as string,
        title: { en: r.title_en as string, jp: r.title_jp as string },
        cost: r.cost as number,
        tag: (r.tag as Reward["tag"]) ?? undefined,
      }));
    }
  } catch (e) {
    console.error("[getMemberDashboard] read failed, showing defaults:", (e as Error).message);
  }

  // --- derived stats ---
  const attended = history.filter((h) => h.went).length;
  const totalPast = history.length;
  const showRate = totalPast ? Math.round((attended / totalPast) * 100) : 0;

  // streak = leading run of attended events in newest-first history
  let streak = 0;
  for (const h of history) {
    if (h.went) streak++;
    else break;
  }

  const tier = tierFor(points);
  const curIdx = tiers.findIndex((t) => t.key === tier.key);
  const nextTier = tiers[curIdx + 1] ?? null;
  const progress = nextTier
    ? Math.min(100, ((points - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;
  const ptsToNext = nextTier ? Math.max(0, nextTier.min - points) : 0;

  return {
    name,
    handle: handle || "@" + (fallbackName || "you").toLowerCase().replace(/[^a-z0-9]/g, ""),
    joined,
    isAdmin,
    points,
    tier,
    nextTier,
    progress,
    ptsToNext,
    attended,
    showRate,
    streak,
    inviteCode: inviteCodeFrom(handle, name),
    upcoming,
    history,
    rewards,
  };
}
