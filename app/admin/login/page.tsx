import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const supabase = createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: member } = await supabase
        .from("members")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      redirect(member?.is_admin ? "/admin" : "/me");
    }
  }

  return (
    <main className="stage">
      <AuthForm initialMode="login" admin />
    </main>
  );
}
