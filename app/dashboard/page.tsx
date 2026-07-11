import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";
import Logo from "@/app/logo";
import SignOutButton from "./sign-out-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <Logo size="sm" className="mb-1" />
            <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
              Sales dashboard
            </h1>
          </div>
          <SignOutButton email={user.email ?? ""} />
        </div>
        <DashboardClient />
      </div>
    </main>
  );
}
