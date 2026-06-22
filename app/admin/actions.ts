"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { buildInsertRow, buildUpdateRow } from "@/lib/events";
import { seriesDates, slugify } from "@/lib/recurrence";
import { pointsFor, inviteBonusFor } from "@/lib/formulas";
import type { EventInput, Recurrence, EventStatus, SaveResult } from "@/lib/types";

async function adminClient() {
  const supabase = createClient();
  if (!supabase) return { error: "Supabase isn't connected yet." as const };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." as const };
  return { supabase, user };
}

// short random suffix to keep slugs unique
const rnd = () => Math.random().toString(36).slice(2, 6);

export async function saveEvent(
  input: EventInput,
  status: EventStatus,
  recurrence: Recurrence
): Promise<SaveResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  // displayed RSVP count = online sign-ups + admin-set "known" RSVPs.
  // Done as a best-effort secondary write so saves still work before the
  // known_rsvp migration (0003) is applied.
  async function applyKnown(eventId: string, known: number) {
    try {
      const { count } = await supabase
        .from("rsvps")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventId);
      await supabase
        .from("events")
        .update({ known_rsvp: known, rsvp: (count ?? 0) + known })
        .eq("id", eventId);
    } catch {
      /* column not present yet — ignore */
    }
  }
  // LINE group link — best-effort (works before the line_url migration 0006)
  async function applyLineUrl(eventId: string) {
    try {
      await supabase.from("events").update({ line_url: input.lineUrl || null }).eq("id", eventId);
    } catch {
      /* column not present yet — ignore */
    }
  }
  // Sign-up form link — best-effort (works before the form_url migration 0011)
  async function applyFormUrl(eventId: string) {
    try {
      await supabase.from("events").update({ form_url: input.formUrl || null }).eq("id", eventId);
    } catch {
      /* column not present yet — ignore */
    }
  }
  // Google Maps link — best-effort (works before the maps_url migration 0012)
  async function applyMapsUrl(eventId: string) {
    try {
      await supabase.from("events").update({ maps_url: input.mapsUrl || null }).eq("id", eventId);
    } catch {
      /* column not present yet — ignore */
    }
  }
  const known = Math.max(0, Number(input.knownRsvp) || 0);

  try {
    if (input.id) {
      // --- edit existing ---
      const { error } = await supabase
        .from("events")
        .update(buildUpdateRow(input, status))
        .eq("id", input.id);
      if (error) return { error: error.message };
      await applyKnown(input.id, known);
      await applyLineUrl(input.id);
      await applyFormUrl(input.id);
      await applyMapsUrl(input.id);
      revalidatePath("/admin");
      revalidatePath("/");
      revalidateTag("events");
      return { ok: true, count: 1 };
    }

    // --- create (one-time or a series) ---
    const count = recurrence.freq !== "none" ? Math.max(1, Math.min(24, recurrence.count)) : 1;
    const dates = seriesDates(input.date, recurrence.freq, count);
    const base = slugify(input.titleEn);
    const rows = dates.map((d, i) =>
      buildInsertRow(input, status, d, `-${rnd()}${i ? "-" + (i + 1) : ""}`)
    );
    // override slug base so all share a readable stem
    rows.forEach((r, i) => {
      r.slug = `${base}-${rnd()}${i ? "-" + (i + 1) : ""}`;
    });

    const { data: inserted, error } = await supabase.from("events").insert(rows).select("id");
    if (error) return { error: error.message };
    if (inserted) {
      for (const row of inserted as { id: string }[]) {
        if (known > 0) await applyKnown(row.id, known);
        if (input.lineUrl) await applyLineUrl(row.id);
        if (input.formUrl) await applyFormUrl(row.id);
        if (input.mapsUrl) await applyMapsUrl(row.id);
      }
    }
    revalidatePath("/admin");
    revalidatePath("/");
    revalidateTag("events");
    return { ok: true, count: rows.length };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function duplicateEvent(id: string): Promise<SaveResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  try {
    const { data: src, error: readErr } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();
    if (readErr || !src) return { error: readErr?.message || "Event not found." };

    // clone as a new draft: reset attendance/rsvp, append "(copy)" to titles
    const { id: _omit, created_at: _omit2, ...rest } = src as Record<string, unknown>;
    const copy = {
      ...rest,
      slug: `${slugify(String(src.title_en))}-${rnd()}`,
      title_en: `${src.title_en} (copy)`,
      title_jp: `${src.title_jp}（コピー）`,
      status: "draft",
      attended: null,
      rsvp: 0,
      gallery: 0,
    };
    const { error } = await supabase.from("events").insert(copy);
    if (error) return { error: error.message };
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export type CheckInResult = { ok?: true; error?: string; attended?: number; points?: number };

/** Finish & record check-in: mark attendance, complete the event, and write
 *  participation points + invite bonuses to the ledger. Safe to re-run
 *  (it clears this event's earned-ledger rows first, then rewrites them). */
export async function finishCheckIn(eventId: string, presentIds: string[], guestCount = 0): Promise<CheckInResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;
  const present = new Set(presentIds);
  const guests = Math.max(0, Number(guestCount) || 0);

  try {
    // event (for pricing + date)
    const { data: ev, error: evErr } = await supabase
      .from("events")
      .select("id, price, date")
      .eq("id", eventId)
      .single();
    if (evErr || !ev) return { error: evErr?.message || "Event not found." };
    const per = pointsFor({ price: ev.price as number });
    const evDate = ev.date as string;

    // existing RSVPs for this event
    const { data: rsvps } = await supabase
      .from("rsvps")
      .select("member_id")
      .eq("event_id", eventId);
    const existing = (rsvps ?? []).map((r) => (r as { member_id: string }).member_id);

    // present = everyone marked present (incl. walk-ins added at the door);
    // absent = previously-RSVP'd members not marked present.
    const presentList = [...present];
    const absentList = existing.filter((id) => !present.has(id));

    // upsert present rows (creates attendance for walk-ins who didn't RSVP)
    if (presentList.length)
      await supabase
        .from("rsvps")
        .upsert(
          presentList.map((id) => ({ event_id: eventId, member_id: id, attended: true })),
          { onConflict: "event_id,member_id" }
        );
    if (absentList.length)
      await supabase.from("rsvps").update({ attended: false }).eq("event_id", eventId).in("member_id", absentList);

    // member info for present members: referrers + admin flag (admins attend free)
    const referrerOf: Record<string, string | null> = {};
    const adminIds = new Set<string>();
    if (presentList.length) {
      const { data: mems } = await supabase
        .from("members")
        .select("id, referred_by, is_admin")
        .in("id", presentList);
      for (const m of (mems ?? []) as { id: string; referred_by: string | null; is_admin: boolean }[]) {
        referrerOf[m.id] = m.referred_by;
        if (m.is_admin) adminIds.add(m.id);
      }
    }
    const adminPresent = presentList.filter((id) => adminIds.has(id)).length;
    const attended = presentList.length + guests; // total headcount
    const paid = Math.max(0, presentList.length - adminPresent) + guests; // paying (members minus admins) + guests

    // 2) complete the event (headcount), then record the paying split (best-effort
    //    so it still works before the attendance-split migration 0009)
    const { error: upErr } = await supabase
      .from("events")
      .update({ status: "completed", attended })
      .eq("id", eventId);
    if (upErr) return { error: upErr.message };
    try {
      await supabase.from("events").update({ paid_attended: paid, guest_count: guests }).eq("id", eventId);
    } catch {
      /* columns not present yet — ignore */
    }

    // 3) rewrite this event's earned-ledger rows (idempotent)
    await supabase
      .from("points_ledger")
      .delete()
      .eq("event_id", eventId)
      .in("kind", ["participation", "invite_fresh", "invite_returning", "invite"]);

    const ledger: Array<{ member_id: string; event_id: string; kind: string; points: number }> = [];

    // participation points for each present member
    for (const id of presentList) {
      ledger.push({ member_id: id, event_id: eventId, kind: "participation", points: per });
    }

    // referral bonuses: credit the referrer based on the friend's attendance count
    if (presentList.length) {
      const friends = presentList.filter((id) => referrerOf[id]);
      if (friends.length) {
        // count each friend's attendances on or before this event's date (excluding this one)
        const { data: att } = await supabase
          .from("rsvps")
          .select("member_id, event_id, events(date)")
          .in("member_id", friends)
          .eq("attended", true);
        const prior: Record<string, number> = {};
        for (const r of (att ?? []) as unknown as Array<{ member_id: string; event_id: string; events: { date: string } | null }>) {
          if (r.event_id === eventId) continue;
          const d = r.events?.date;
          if (d && d <= evDate) prior[r.member_id] = (prior[r.member_id] || 0) + 1;
        }
        for (const fid of friends) {
          const bonus = inviteBonusFor(prior[fid] || 0);
          if (bonus > 0) ledger.push({ member_id: referrerOf[fid]!, event_id: eventId, kind: "invite", points: bonus });
        }
      }
    }

    if (ledger.length) {
      const { error: insErr } = await supabase.from("points_ledger").insert(ledger);
      if (insErr) return { error: insErr.message };
    }

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/me");
    revalidateTag("events");
    return { ok: true, attended, points: presentList.length * per };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteEvent(id: string): Promise<SaveResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  try {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ---- rewards ----
export type RewardInput = { id?: string; titleEn: string; titleJp: string; cost: number; tag: string | null };
export async function saveReward(r: RewardInput): Promise<SaveResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;
  try {
    const row = {
      id: r.id && r.id.trim() ? r.id : `r_${rnd()}${rnd()}`,
      title_en: r.titleEn || "Reward",
      title_jp: r.titleJp || r.titleEn || "特典",
      cost: Math.max(0, Number(r.cost) || 0),
      tag: r.tag === "popular" || r.tag === "limited" ? r.tag : null,
    };
    const { error } = await supabase.from("rewards").upsert(row);
    if (error) return { error: error.message };
    revalidatePath("/admin");
    revalidatePath("/me");
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteReward(id: string): Promise<SaveResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;
  try {
    const { error } = await supabase.from("rewards").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin");
    revalidatePath("/me");
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ---- site settings ----
export async function setHeroImage(url: string | null): Promise<SaveResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;
  try {
    const { error } = await supabase
      .from("settings")
      .upsert({ id: 1, hero_image_url: url, updated_at: new Date().toISOString() });
    if (error) return { error: error.message };
    revalidateTag("settings");
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function setSiteLinks(
  lineUrl: string | null,
  instagramUrl: string | null,
  discordUrl: string | null
): Promise<SaveResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;
  try {
    // Primary save: the columns that have shipped longest. Done first so the
    // links always persist even if a newer column isn't migrated yet.
    const { error } = await supabase
      .from("settings")
      .upsert({ id: 1, line_url: lineUrl || null, instagram_url: instagramUrl || null, updated_at: new Date().toISOString() });
    if (error) return { error: error.message };

    // Best-effort: discord_url may not exist until migration 0008 is applied.
    // Don't let a missing column fail the whole save — skip it gracefully.
    const { error: dErr } = await supabase
      .from("settings")
      .update({ discord_url: discordUrl || null })
      .eq("id", 1);
    if (dErr && !/discord_url/.test(dErr.message)) return { error: dErr.message };

    revalidateTag("settings");
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/** Point thresholds for the Regular & Insider ranks (Guest is always 0). */
export async function setTierThresholds(regularMin: number, insiderMin: number): Promise<SaveResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;

  const reg = Math.round(Number(regularMin));
  const ins = Math.round(Number(insiderMin));
  if (!Number.isFinite(reg) || reg < 1) return { error: "Regular must be at least 1 point." };
  if (!Number.isFinite(ins) || ins <= reg) return { error: "Insider must be higher than Regular." };

  try {
    const { error } = await supabase
      .from("settings")
      .upsert({ id: 1, tier_regular_min: reg, tier_insider_min: ins, updated_at: new Date().toISOString() });
    if (error) return { error: error.message };
    revalidateTag("settings");
    revalidatePath("/");
    revalidatePath("/me");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ---- rsvps (for the event editor) ----
export type RsvpMember = { memberId: string; name: string; country: string; attended: boolean };

/** Real member accounts that RSVP'd to an event. */
export async function listEventRsvps(
  eventId: string
): Promise<{ rsvps?: RsvpMember[]; error?: string }> {
  const ctx = await adminClient();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;
  try {
    const { data, error } = await supabase
      .from("rsvps")
      .select("member_id, attended, members(name, country)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });
    if (error) return { error: error.message };
    const rows = (data ?? []) as unknown as Array<{
      member_id: string;
      attended: boolean;
      members: { name: string | null; country: string | null } | null;
    }>;
    return {
      rsvps: rows.map((r) => ({
        memberId: r.member_id,
        name: r.members?.name || "Member",
        country: r.members?.country || "",
        attended: Boolean(r.attended),
      })),
    };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

/** Remove a member's RSVP from an event (the events.rsvp count re-syncs via trigger). */
export async function removeRsvp(eventId: string, memberId: string): Promise<SaveResult> {
  const ctx = await adminClient();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase } = ctx;
  try {
    const { error } = await supabase
      .from("rsvps")
      .delete()
      .eq("event_id", eventId)
      .eq("member_id", memberId);
    if (error) return { error: error.message };
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/me");
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
