/* Server-side Supabase client (server components, route handlers, actions).
   Reads/writes the auth session from cookies so RLS sees the logged-in user.
   Returns null if env vars aren't set yet. */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  const cookieStore = cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In Server Components this throws (read-only cookies); the middleware
        // refreshes the session, so it's safe to ignore here.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* no-op */
        }
      },
    },
  });
}
