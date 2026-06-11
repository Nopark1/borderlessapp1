import { redirect } from "next/navigation";
import { MemberDashboard } from "@/components/MemberDashboard";
import { createClient } from "@/lib/supabase-server";
import { getMemberDashboard } from "@/lib/member";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const supabase = createClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await getMemberDashboard(supabase, user);
  return (
    <main className="stage">
      <MemberDashboard data={data} />
    </main>
  );
}
