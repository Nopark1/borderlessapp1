/* Site-wide settings (single row), e.g. the homepage hero image. */

import "server-only";
import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

export type SiteSettings = {
  heroImageUrl: string | null;
  lineUrl: string | null;
  instagramUrl: string | null;
  discordUrl: string | null;
};

const EMPTY_SETTINGS: SiteSettings = { heroImageUrl: null, lineUrl: null, instagramUrl: null, discordUrl: null };

/** Cached site settings (hero image) — public, rarely changes. Tagged "settings",
 *  invalidated when an admin updates the hero image. */
export const getCachedSettings = unstable_cache(
  async (): Promise<SiteSettings> => getSettings(getSupabase()),
  ["site-settings"],
  { revalidate: 300, tags: ["settings"] }
);

export async function getSettings(supabase: SupabaseClient | null): Promise<SiteSettings> {
  if (!supabase) return EMPTY_SETTINGS;
  try {
    // select * so missing columns (pre-migration) don't error the whole read
    const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
    return {
      heroImageUrl: (data?.hero_image_url as string) || null,
      lineUrl: (data?.line_url as string) || null,
      instagramUrl: (data?.instagram_url as string) || null,
      discordUrl: (data?.discord_url as string) || null,
    };
  } catch {
    return EMPTY_SETTINGS;
  }
}
