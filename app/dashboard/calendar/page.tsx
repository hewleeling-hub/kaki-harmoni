import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import CalendarClient from "./calendar-client";

// Every role: whoever is on the floor needs to know who is coming and when.
export default async function CalendarPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          Calendar
        </h1>
        <p className="text-black/60 mt-1">Every slot for a day, who is booked in, and how many machines are free.</p>
      </div>
      <CalendarClient />
    </div>
  );
}
