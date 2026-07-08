import DashboardClient from "./dashboard-client";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <p className="uppercase tracking-widest text-xs font-medium" style={{ color: "var(--clay)" }}>
            Kaki Harmoni
          </p>
          <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            Sales dashboard
          </h1>
        </div>
        <DashboardClient />
      </div>
    </main>
  );
}
