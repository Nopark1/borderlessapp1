import { redirect } from "next/navigation";
import { AdminApp } from "@/components/admin/AdminApp";
import { createClient } from "@/lib/supabase-server";
import { getAdminEvents } from "@/lib/events";
import { getOverview, getMembersTable, getRewards } from "@/lib/admin-stats";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // gate on is_admin
  const { data: member } = await supabase
    .from("members")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!member?.is_admin) redirect("/me");

  const [events, overview, members, rewards, settings] = await Promise.all([
    getAdminEvents(supabase),
    getOverview(supabase),
    getMembersTable(supabase),
    getRewards(supabase),
    getSettings(supabase),
  ]);

  return (
    <main className="admin-stage">
      <AdminApp
        initialEvents={events}
        overview={overview}
        members={members}
        rewards={rewards}
        heroImageUrl={settings.heroImageUrl}
        email={user.email ?? "admin"}
      />
    </main>
  );
}
