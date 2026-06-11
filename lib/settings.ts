/* Site-wide settings (single row), e.g. the homepage hero image. */

import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

export type SiteSettings = { heroImageUrl: string | null };

/** Cached site settings (hero image) — public, rarely changes. Tagged "settings",
 *  invalidated when an admin updates the hero image. */
export const getCachedSettings = unstable_cache(
  async (): Promise<SiteSettings> => getSettings(getSupabase()),
  ["site-settings"],
  { revalidate: 300, tags: ["settings"] }
);

export async function getSettings(supabase: SupabaseClient | null): Promise<SiteSettings> {
  if (!supabase) return { heroImageUrl: null };
  try {
    const { data } = await supabase
      .from("settings")
      .select("hero_image_url")
      .eq("id", 1)
      .maybeSingle();
    return { heroImageUrl: (data?.hero_image_url as string) || null };
  } catch {
    return { heroImageUrl: null };
  }
}
