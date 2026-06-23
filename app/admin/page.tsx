import { redirect } from "next/navigation";
import { AdminApp } from "@/components/admin/AdminApp";
import { createClient } from "@/lib/supabase-server";
import { getAdminBundle } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Gate check and dashboard data load run concurrently to save a round-trip.
  // The bundle is RLS-protected and discarded on redirect, so fetching it for a
  // would-be non-admin leaks nothing.
  const [memberRes, bundle] = await Promise.all([
    supabase.from("members").select("is_admin").eq("id", user.id).maybeSingle(),
    getAdminBundle(supabase),
  ]);
  if (!memberRes.data?.is_admin) redirect("/me");

  return (
    <main className="admin-stage">
      <AdminApp
        initialEvents={bundle.events}
        overview={bundle.overview}
        members={bundle.members}
        rewards={bundle.rewards}
        heroImageUrl={bundle.heroImageUrl}
        lineUrl={bundle.lineUrl}
        instagramUrl={bundle.instagramUrl}
        discordUrl={bundle.discordUrl}
        tierRegularMin={bundle.tierRegularMin}
        tierInsiderMin={bundle.tierInsiderMin}
        email={user.email ?? "admin"}
      />
    </main>
  );
}
