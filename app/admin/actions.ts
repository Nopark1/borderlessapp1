"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { buildInsertRow, buildUpdateRow } from "@/lib/events";
import { seriesDates, slugify } from "@/lib/recurrence";
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

  try {
    if (input.id) {
      // --- edit existing ---
      const { error } = await supabase
        .from("events")
        .update(buildUpdateRow(input, status))
        .eq("id", input.id);
      if (error) return { error: error.message };
      revalidatePath("/admin");
      revalidatePath("/");
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

    const { error } = await supabase.from("events").insert(rows);
    if (error) return { error: error.message };
    revalidatePath("/admin");
    revalidatePath("/");
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
