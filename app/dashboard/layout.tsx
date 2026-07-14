import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import DashboardShell from "./dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <DashboardShell email={profile.email ?? ""} role={profile.role}>
      {children}
    </DashboardShell>
  );
}
