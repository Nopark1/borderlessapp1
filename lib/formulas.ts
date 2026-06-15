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
// ¥1,000 → 10 pts ; ¥2,500 → 25 pts. Free events (¥0) award a flat 5 pts.
export const pointsFor = (e: Pick<Event, "price">): number => {
  const p = Number(e && e.price) || 0;
  return p <= 0 ? 5 : Math.floor(p / 100);
};

// Invite bonus — credited to the referrer when their friend ATTENDS an event,
// scaling with the friend's number of attendances:
//   1st event → +5,  2nd → +10,  3rd → +15,  4th+ → none.
export const inviteBonus = { first: 5, second: 10, third: 15 } as const;

/** Bonus for the referrer, given how many events the friend attended BEFORE this one. */
export function inviteBonusFor(priorAttended: number): number {
  if (priorAttended <= 0) return inviteBonus.first; // their 1st time
  if (priorAttended === 1) return inviteBonus.second; // 2nd
  if (priorAttended === 2) return inviteBonus.third; // 3rd
  return 0; // 4th+
}

// Break-even: how many paying attendees cover the event's total cost.
export const breakEven = (e: Pick<Event, "price" | "cost">): number =>
  Number(e.price) > 0 ? Math.ceil((Number(e.cost) || 0) / Number(e.price)) : 0;

// Per-event finance. Revenue is projected at capacity until the event is held.
// Once held, revenue counts only PAYING attendees (paid_attended) — admins/staff
// attend free; falls back to total attendance for events recorded before that split.
export const finOf = (
  e: Pick<Event, "price" | "capacity" | "cost" | "attended" | "paidAttended">
): { revenue: number; costs: number; net: number; completed: boolean } => {
  const completed = e.attended !== null && e.attended !== undefined;
  const paying = (e.paidAttended ?? e.attended) ?? 0;
  const revenue = completed ? paying * e.price : Number(e.price) * Number(e.capacity);
  const costs = Number(e.cost) || 0;
  return { revenue, costs, net: revenue - costs, completed };
};

// Points to award at check-in for an event.
export const pointsAwarded = (e: Pick<Event, "price">, attendedCount: number): number =>
  attendedCount * pointsFor(e);

// tier = highest tier whose `min` <= member's points balance.
// Pass a custom ladder (from admin-set thresholds); defaults to the seed tiers.
export const tierFor = (points: number, tierList: Tier[] = tiers): Tier => {
  let result = tierList[0];
  for (const t of tierList) {
    if (t.min <= points) result = t;
  }
  return result;
};
