import { redirect } from "next/navigation";
import { AdminApp } from "@/components/admin/AdminApp";
import { createClient } from "@/lib/supabase-server";
import { getAdminEvents } from "@/lib/events";

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

  const events = await getAdminEvents(supabase);
  return (
    <main className="admin-stage">
      <AdminApp initialEvents={events} email={user.email ?? "admin"} />
    </main>
  );
}
