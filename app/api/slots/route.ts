import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSlotsForDay, remainingFor } from "@/lib/slots";
import { occupancyForDate } from "@/lib/capacity";
import { soaksForSlug } from "@/config/catalogue";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "A valid date is required." }, { status: 400 });
  }

  // Availability depends on WHAT is being booked, not just when. A Double
  // Reset is two soaks back to back, which needs two machines rather than
  // one, so a slot with a single place left is full for it. The chosen tier
  // travels here as ?option= — the same slug the booking flow already carries
  // — and anything unrecognised falls back to one soak.
  const soaks = soaksForSlug(request.nextUrl.searchParams.get("option"));

  const supabase = createAdminClient();

  // Machine-minutes, not bookings and not head-count: see lib/capacity.ts.
  let occupancy: Awaited<ReturnType<typeof occupancyForDate>>;
  try {
    occupancy = await occupancyForDate(supabase, date);
  } catch {
    return NextResponse.json({ error: "Could not load availability." }, { status: 500 });
  }

  const slots = generateSlotsForDay().map((time) => ({
    time,
    remaining: remainingFor(occupancy, time, soaks),
  }));

  return NextResponse.json({ slots });
}
