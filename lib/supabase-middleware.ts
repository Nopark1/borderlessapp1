/* Refreshes the Supabase auth session on every request and syncs cookies,
   so server components always see a valid session. No-ops if env isn't set. */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Touch the session so expiring tokens get refreshed into the response
  // cookies. getSession() refreshes when needed but, unlike getUser(), avoids a
  // verify round-trip on every request — protected pages still call getUser()
  // themselves for the real check.
  try {
    await supabase.auth.getSession();
  } catch {
    /* network/offline — leave cookies as-is */
  }

  return response;
}
