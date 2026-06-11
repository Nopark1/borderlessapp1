/* Admin analytics: overview metrics, monthly charts, and the members table.
   Computed live from the database (resilient — returns zeros/empties if a read
   fails or the project has little data yet). */

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Event, Reward } from "./types";
import { fromRow } from "./events";
import { rewards as seedRewards } from "./data";
import { pointsFor, finOf, tierFor } from "./formulas";

export type MonthPoint = { m: string; members: number; revenue: number; costs: number };

export type OverviewData = {
  revenue: number;
  costs: number;
  net: number;
  showRate: number;
  activeMembers: number;
  invitedTotal: number;
  attendedTotal: number;
  pointsIssued: number;
  pointsRedeemed: number;
  avgPerHead: number;
  months: MonthPoint[];
  past: Event[];
};

export type MemberRow = {
  id: string;
  name: string;
  country: string;
  tier: string;
  attended: number;
  points: number;
  spend: number;
  status: "active" | "lapsing";
  lastEvent: string;
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const EMPTY_OVERVIEW: OverviewData = {
  revenue: 0, costs: 0, net: 0, showRate: 0, activeMembers: 0,
  invitedTotal: 0, attendedTotal: 0, pointsIssued: 0, pointsRedeemed: 0,
  avgPerHead: 0, months: [], past: [],
};

export async function getOverview(supabase: SupabaseClient): Promise<OverviewData> {
  try {
    // completed events drive finance
    const { data: evRows } = await supabase
      .from("events")
      .select("*")
      .eq("status", "completed")
      .order("date", { ascending: false });
    const past = (evRows ?? []).map((r) => fromRow(r as Parameters<typeof fromRow>[0]));

    let revenue = 0, costs = 0, invitedTotal = 0, attendedTotal = 0;
    for (const e of past) {
      const f = finOf(e);
      revenue += f.revenue;
      costs += f.costs;
      invitedTotal += e.invited || 0;
      attendedTotal += e.attended || 0;
    }
    const net = revenue - costs;
    const showRate = invitedTotal ? Math.round((attendedTotal / invitedTotal) * 100) : 0;
    const avgPerHead = attendedTotal ? Math.round(revenue / attendedTotal) : 0;

    // ledger → points issued / redeemed
    const { data: ledger } = await supabase.from("points_ledger").select("points");
    let pointsIssued = 0, pointsRedeemed = 0;
    for (const row of (ledger ?? []) as { points: number }[]) {
      if (row.points >= 0) pointsIssued += row.points;
      else pointsRedeemed += -row.points;
    }

    // members (count + growth)
    const { data: members } = await supabase.from("members").select("joined");
    const activeMembers = members?.length ?? 0;

    // last-6-months series
    const now = new Date();
    const months: MonthPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      let mRev = 0, mCost = 0;
      for (const e of past) {
        if (e.date.startsWith(key)) {
          const f = finOf(e);
          mRev += f.revenue;
          mCost += f.costs;
        }
      }
      const mMembers = (members ?? []).filter((m) => {
        const j = (m as { joined: string }).joined;
        return j && new Date(j + "T00:00:00") <= end;
      }).length;
      months.push({ m: MONTH_LABELS[d.getMonth()], members: mMembers, revenue: mRev, costs: mCost });
    }

    return { revenue, costs, net, showRate, activeMembers, invitedTotal, attendedTotal, pointsIssued, pointsRedeemed, avgPerHead, months, past };
  } catch (e) {
    console.error("[getOverview] failed:", (e as Error).message);
    return EMPTY_OVERVIEW;
  }
}

export async function getMembersTable(supabase: SupabaseClient): Promise<MemberRow[]> {
  try {
    const { data: members } = await supabase
      .from("members")
      .select("id, name, country");
    if (!members?.length) return [];

    const ids = members.map((m) => (m as { id: string }).id);

    // points balance per member
    const { data: ledger } = await supabase
      .from("points_ledger")
      .select("member_id, points")
      .in("member_id", ids);
    const points: Record<string, number> = {};
    for (const r of (ledger ?? []) as { member_id: string; points: number }[]) {
      points[r.member_id] = (points[r.member_id] || 0) + r.points;
    }

    // attended rsvps with event price/date/title for spend, count, last seen
    const { data: rsvps } = await supabase
      .from("rsvps")
      .select("member_id, attended, events(price, date, title_en, title_jp)")
      .eq("attended", true)
      .in("member_id", ids);

    type RsvpJoin = { member_id: string; events: { price: number; date: string; title_en: string } | null };
    const attended: Record<string, number> = {};
    const spend: Record<string, number> = {};
    const last: Record<string, { date: string; title: string }> = {};
    for (const r of (rsvps ?? []) as unknown as RsvpJoin[]) {
      if (!r.events) continue;
      attended[r.member_id] = (attended[r.member_id] || 0) + 1;
      spend[r.member_id] = (spend[r.member_id] || 0) + (r.events.price || 0);
      const cur = last[r.member_id];
      if (!cur || r.events.date > cur.date) last[r.member_id] = { date: r.events.date, title: r.events.title_en };
    }

    const now = Date.now();
    const rows: MemberRow[] = members.map((m) => {
      const mm = m as { id: string; name: string | null; country: string | null };
      const pts = points[mm.id] || 0;
      const lastSeen = last[mm.id];
      const lapsing = !lastSeen || now - new Date(lastSeen.date + "T00:00:00").getTime() > 1000 * 60 * 60 * 24 * 60;
      return {
        id: mm.id,
        name: mm.name || "Member",
        country: mm.country || "",
        tier: tierFor(pts).key,
        attended: attended[mm.id] || 0,
        points: pts,
        spend: spend[mm.id] || 0,
        status: lapsing ? "lapsing" : "active",
        lastEvent: lastSeen?.title || "—",
      };
    });
    rows.sort((a, b) => b.points - a.points);
    return rows;
  } catch (e) {
    console.error("[getMembersTable] failed:", (e as Error).message);
    return [];
  }
}

export type AdminBundle = {
  events: Event[];
  overview: OverviewData;
  members: MemberRow[];
  rewards: Reward[];
  heroImageUrl: string | null;
};

/** Everything the admin dashboard needs, in one parallel batch (6 queries) and
 *  computed in memory — far fewer round-trips than fetching each section
 *  separately. Resilient: returns sensible empties if a read fails. */
export async function getAdminBundle(supabase: SupabaseClient): Promise<AdminBundle> {
  const empty: AdminBundle = {
    events: [],
    overview: EMPTY_OVERVIEW,
    members: [],
    rewards: seedRewards,
    heroImageUrl: null,
  };
  try {
    const [evRes, memRes, ledRes, rsvpRes, rwRes, setRes] = await Promise.all([
      supabase.from("events").select("*").order("date", { ascending: false }),
      supabase.from("members").select("id, name, country, joined, is_admin"),
      supabase.from("points_ledger").select("member_id, points"),
      supabase.from("rsvps").select("member_id, attended, events(price, date, title_en)").eq("attended", true),
      supabase.from("rewards").select("id, title_en, title_jp, cost, tag").order("cost", { ascending: true }),
      supabase.from("settings").select("hero_image_url").eq("id", 1).maybeSingle(),
    ]);

    // ---- events ----
    const events = (evRes.data ?? []).map((r) => fromRow(r as Parameters<typeof fromRow>[0]));
    const past = events.filter((e) => e.status === "completed"); // already date-desc

    // ---- ledger (points balances + issued/redeemed) ----
    const ledger = (ledRes.data ?? []) as { member_id: string; points: number }[];
    const pointsByMember: Record<string, number> = {};
    let pointsIssued = 0;
    let pointsRedeemed = 0;
    for (const r of ledger) {
      pointsByMember[r.member_id] = (pointsByMember[r.member_id] || 0) + r.points;
      if (r.points >= 0) pointsIssued += r.points;
      else pointsRedeemed += -r.points;
    }

    // ---- members ----
    const memberRows = (memRes.data ?? []) as { id: string; name: string | null; country: string | null; joined: string | null }[];
    const activeMembers = memberRows.length;

    // ---- attended rsvps (for members table spend / count / last seen) ----
    type RsvpJoin = { member_id: string; events: { price: number; date: string; title_en: string } | null };
    const attendedRows = (rsvpRes.data ?? []) as unknown as RsvpJoin[];
    const attCount: Record<string, number> = {};
    const spend: Record<string, number> = {};
    const last: Record<string, { date: string; title: string }> = {};
    for (const r of attendedRows) {
      if (!r.events) continue;
      attCount[r.member_id] = (attCount[r.member_id] || 0) + 1;
      spend[r.member_id] = (spend[r.member_id] || 0) + (r.events.price || 0);
      const cur = last[r.member_id];
      if (!cur || r.events.date > cur.date) last[r.member_id] = { date: r.events.date, title: r.events.title_en };
    }

    // ---- overview totals ----
    let revenue = 0, costs = 0, invitedTotal = 0, attendedTotal = 0;
    for (const e of past) {
      const f = finOf(e);
      revenue += f.revenue;
      costs += f.costs;
      invitedTotal += e.invited || 0;
      attendedTotal += e.attended || 0;
    }
    const net = revenue - costs;
    const showRate = invitedTotal ? Math.round((attendedTotal / invitedTotal) * 100) : 0;
    const avgPerHead = attendedTotal ? Math.round(revenue / attendedTotal) : 0;

    // ---- monthly series (last 6 months) ----
    const now = new Date();
    const months: MonthPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      let mRev = 0, mCost = 0;
      for (const e of past) {
        if (e.date.startsWith(key)) {
          const f = finOf(e);
          mRev += f.revenue;
          mCost += f.costs;
        }
      }
      const mMembers = memberRows.filter((m) => m.joined && new Date(m.joined + "T00:00:00") <= end).length;
      months.push({ m: MONTH_LABELS[d.getMonth()], members: mMembers, revenue: mRev, costs: mCost });
    }

    const overview: OverviewData = {
      revenue, costs, net, showRate, activeMembers, invitedTotal, attendedTotal,
      pointsIssued, pointsRedeemed, avgPerHead, months, past,
    };

    // ---- members table ----
    const nowMs = Date.now();
    const members: MemberRow[] = memberRows.map((m) => {
      const pts = pointsByMember[m.id] || 0;
      const lastSeen = last[m.id];
      const lapsing = !lastSeen || nowMs - new Date(lastSeen.date + "T00:00:00").getTime() > 1000 * 60 * 60 * 24 * 60;
      return {
        id: m.id,
        name: m.name || "Member",
        country: m.country || "",
        tier: tierFor(pts).key,
        attended: attCount[m.id] || 0,
        points: pts,
        spend: spend[m.id] || 0,
        status: lapsing ? "lapsing" : "active",
        lastEvent: lastSeen?.title || "—",
      };
    });
    members.sort((a, b) => b.points - a.points);

    // ---- rewards + settings ----
    const rwData = rwRes.data ?? [];
    const rewards: Reward[] = rwData.length
      ? rwData.map((r) => ({
          id: r.id as string,
          title: { en: r.title_en as string, jp: r.title_jp as string },
          cost: r.cost as number,
          tag: (r.tag as Reward["tag"]) ?? undefined,
        }))
      : seedRewards;
    const heroImageUrl = (setRes.data?.hero_image_url as string) || null;

    return { events, overview, members, rewards, heroImageUrl };
  } catch (e) {
    console.error("[getAdminBundle] failed:", (e as Error).message);
    return empty;
  }
}

/** Rewards catalog for the admin rewards tab (falls back to seed if empty). */
export async function getRewards(supabase: SupabaseClient): Promise<Reward[]> {
  try {
    const { data } = await supabase
      .from("rewards")
      .select("id, title_en, title_jp, cost, tag")
      .order("cost", { ascending: true });
    if (!data || !data.length) return seedRewards;
    return data.map((r) => ({
      id: r.id as string,
      title: { en: r.title_en as string, jp: r.title_jp as string },
      cost: r.cost as number,
      tag: (r.tag as Reward["tag"]) ?? undefined,
    }));
  } catch {
    return seedRewards;
  }
}

// pointsFor re-export used by the overview table for the "Pts" column
export { pointsFor };
