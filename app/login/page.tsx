import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { mode?: string; ref?: string };
}) {
  // Already signed in? Go straight to the member area.
  const supabase = createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/me");
  }

  const ref = searchParams.ref?.trim() || "";
  // an invite link (?ref=CODE) opens straight into sign-up with the code prefilled
  const mode = searchParams.mode === "signup" || ref ? "signup" : "login";
  return (
    <main className="stage">
      <AuthForm initialMode={mode} initialRef={ref} />
    </main>
  );
}
