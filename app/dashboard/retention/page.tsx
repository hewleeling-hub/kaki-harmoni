import { redirect } from "next/navigation";
import { getProfile, isManager } from "@/lib/auth";
import RetentionClient from "./retention-client";

export default async function RetentionPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!isManager(profile.role)) redirect("/dashboard");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          Retention
        </h1>
        <p className="text-black/60 mt-1">Who comes back, who&apos;s slipping away, and win them back.</p>
      </div>
      <RetentionClient />
    </div>
  );
}
