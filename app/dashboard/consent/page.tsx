import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadConsentPeople } from "@/lib/consent-people";
import ConsentClient from "./consent-client";

export const metadata = {
  title: "Offers permission — Kaki Harmoni",
  robots: { index: false, follow: false },
};

// Every role: whoever collects the paper ticks at the counter is the one entering them.
export default async function ConsentPage() {
  const user = await requireStaff();
  if (!user) redirect("/login");

  const people = await loadConsentPeople(createAdminClient());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          Offers permission
        </h1>
        <p className="text-black/60 mt-1">
          Record who said yes on the paper list, and who has asked us to stop.
        </p>
      </div>
      <ConsentClient people={people} />
    </div>
  );
}
