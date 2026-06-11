/* Site-wide settings (single row), e.g. the homepage hero image. */

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type SiteSettings = { heroImageUrl: string | null };

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
