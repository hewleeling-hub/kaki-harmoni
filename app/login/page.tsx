import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/app/logo";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white/80 rounded-2xl shadow-sm border border-black/5 p-8 space-y-6">
        <div className="text-center space-y-1">
          <Logo size="sm" className="mb-2" />
          <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            Staff login
          </h1>
          <p className="text-black/60 text-sm">Sign in to access the sales dashboard.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
