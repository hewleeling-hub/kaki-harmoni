import DashboardClient from "./dashboard-client";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
        Sales dashboard
      </h1>
      <DashboardClient />
    </div>
  );
}
