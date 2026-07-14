import DashboardClient from "./dashboard-client";
import { getRole, isManager } from "@/lib/auth";

export default async function DashboardPage() {
  const role = await getRole();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
        Sales dashboard
      </h1>
      <DashboardClient canDelete={isManager(role)} />
    </div>
  );
}
