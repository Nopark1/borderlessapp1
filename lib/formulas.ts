/* ============================================================
   Borderless — the formulas (ported EXACTLY from data.js §3).
   These are the heart of the product; do not change the math.
   ============================================================ */

import type { Event, Tier } from "./types";
import { tiers } from "./data";

export const YEN_PER_POINT = 100;

// "Past" / "is past" everywhere means attended != null.
export const isPast = (e: Event): boolean =>
  e.attended !== null && e.attended !== undefined;

// Yen formatter, matching data.js: "¥" + n.toLocaleString("en-US")
export const yen = (n: number): string => "¥" + n.toLocaleString("en-US");

// Points a member earns for ATTENDING an event — scales with entry fee.
// ¥1,000 → 10 pts ; ¥2,500 → 25 pts.
export const pointsFor = (e: Pick<Event, "price">): number =>
  Math.floor((Number(e && e.price) || 0) / 100);

// Invite bonus — credited to the INVITER when their guest actually attends.
// +10 for a brand-new guest, +5 for their 2nd/3rd time (4th+: none).
export const inviteBonus = { fresh: 10, returning: 5 } as const;

// Break-even: how many paying attendees cover the event's total cost.
export const breakEven = (e: Pick<Event, "price" | "cost">): number =>
  Number(e.price) > 0 ? Math.ceil((Number(e.cost) || 0) / Number(e.price)) : 0;

// Per-event finance. Revenue is projected at capacity until the event is held.
export const finOf = (
  e: Pick<Event, "price" | "capacity" | "cost" | "attended">
): { revenue: number; costs: number; net: number; completed: boolean } => {
  const completed = e.attended !== null && e.attended !== undefined;
  const revenue = completed
    ? (e.attended as number) * e.price
    : Number(e.price) * Number(e.capacity);
  const costs = Number(e.cost) || 0;
  return { revenue, costs, net: revenue - costs, completed };
};

// Points to award at check-in for an event.
export const pointsAwarded = (e: Pick<Event, "price">, attendedCount: number): number =>
  attendedCount * pointsFor(e);

// tier = highest tier whose `min` <= member's points balance
export const tierFor = (points: number): Tier => {
  let result = tiers[0];
  for (const t of tiers) {
    if (t.min <= points) result = t;
  }
  return result;
};
