import { redirect } from "next/navigation";
import { getProfile, isManager } from "@/lib/auth";
import TeamClient from "./team-client";

export default async function TeamPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!isManager(profile.role)) redirect("/dashboard");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          Team
        </h1>
        <p className="text-black/60 mt-1">Invite teammates and manage what they can do.</p>
      </div>
      <TeamClient currentUserId={profile.id} currentRole={profile.role} />
    </div>
  );
}
