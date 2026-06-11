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

  // gate on is_admin
  const { data: member } = await supabase
    .from("members")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!member?.is_admin) redirect("/me");

  const bundle = await getAdminBundle(supabase);

  return (
    <main className="admin-stage">
      <AdminApp
        initialEvents={bundle.events}
        overview={bundle.overview}
        members={bundle.members}
        rewards={bundle.rewards}
        heroImageUrl={bundle.heroImageUrl}
        email={user.email ?? "admin"}
      />
    </main>
  );
}
