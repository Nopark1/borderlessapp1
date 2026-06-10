/* Supabase client factory (Phase 2: public reads).
   The anon key is safe to expose to the browser; Row-Level Security decides
   what it can actually read. If the env vars aren't set yet, callers fall back
   to seed data so the app keeps working before Supabase is connected.

   Phase 3 will add a cookie-aware client (@supabase/ssr) for auth. */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
