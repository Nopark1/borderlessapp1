import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Records a Blog analytics event. Admin accounts are excluded here (server-side)
// so their reading/clicking never counts toward the stats.
export const dynamic = "force-dynamic";

const TYPES = new Set(["impression", "view", "dwell", "complete", "share", "download", "readnext", "cta"]);

function deviceOf(ua: string): string {
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  if (/Mobi|iPhone|iPod|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
}

export async function POST(req: NextRequest) {
  let body: { slug?: string; type?: string; ms?: number; source?: string; lang?: string; session?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const slug = typeof body.slug === "string" ? body.slug.slice(0, 200) : "";
  const type = typeof body.type === "string" ? body.type : "";
  if (!slug || !TYPES.has(type)) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = createClient();
  if (!supabase) return NextResponse.json({ ok: true, skipped: "no-db" });

  // Exclude admins. getSession is a cookie read (no network for anonymous
  // visitors); the is_admin lookup only runs for signed-in users.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) {
    const { data: m } = await supabase.from("members").select("is_admin").eq("id", session.user.id).maybeSingle();
    if (m?.is_admin) return NextResponse.json({ ok: true, skipped: "admin" });
  }

  const ms = type === "dwell" ? Math.max(0, Math.min(6 * 60 * 60 * 1000, Math.round(Number(body.ms) || 0))) : null;
  const base = {
    slug,
    type,
    ms,
    session: typeof body.session === "string" ? body.session.slice(0, 64) : null,
  };
  const full = {
    ...base,
    source: typeof body.source === "string" ? body.source.slice(0, 60) : null,
    lang: body.lang === "jp" ? "jp" : body.lang === "en" ? "en" : null,
    device: deviceOf(req.headers.get("user-agent") || ""),
  };

  try {
    const { error } = await supabase.from("article_events").insert(full);
    // Fall back to base columns if the dimension columns aren't migrated yet (0016).
    if (error) await supabase.from("article_events").insert(base);
  } catch {
    /* table not present yet (pre-migration 0015) — ignore */
  }
  return NextResponse.json({ ok: true });
}
