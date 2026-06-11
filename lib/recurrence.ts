/* Date + slug helpers for event creation (ported from admin.jsx). */

import type { RepeatFreq } from "./types";

function fmtISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return fmtISO(d);
}

function addMonths(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setMonth(d.getMonth() + n);
  return fmtISO(d);
}

/** Dates for a recurring series (publishing a series creates N independent events). */
export function seriesDates(start: string, freq: RepeatFreq, count: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    if (freq === "weekly") out.push(addDays(start, 7 * i));
    else if (freq === "biweekly") out.push(addDays(start, 14 * i));
    else if (freq === "monthly") out.push(addMonths(start, i));
    else out.push(start);
  }
  return out;
}

export function slugify(title: string): string {
  return (
    (title || "event")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "event"
  );
}
