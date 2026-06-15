import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Lightweight auth probe for the static homepage. Returns just enough to swap
// the header buttons (My profile / Admin) after the cached HTML loads, so the
// page itself can stay statically rendered.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  if (!supabase) return NextResponse.json({ signedIn: false, isAdmin: false });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return NextResponse.json({ signedIn: false, isAdmin: false });

  const { data: m } = await supabase
    .from("members")
    .select("is_admin")
    .eq("id", session.user.id)
    .maybeSingle();
  return NextResponse.json({ signedIn: true, isAdmin: Boolean(m?.is_admin) });
}
