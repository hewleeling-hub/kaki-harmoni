import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSlotsForDay, machinesBusyAt, MAX_CAPACITY_PER_SLOT } from "@/lib/slots";
import { seatsBookedByTime } from "@/lib/capacity";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "A valid date is required." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // People, not bookings — a party of three is three of the four places, not
  // one. See lib/capacity.ts.
  let seats: Record<string, number>;
  try {
    seats = await seatsBookedByTime(supabase, date);
  } catch {
    return NextResponse.json({ error: "Could not load availability." }, { status: 500 });
  }

  // A machine is tied up for 45 minutes per guest — 15 in the water, 30
  // standing — so a booking blocks its own slot AND the next one. Counting
  // only the bookings made at a slot showed 11:00 as free when 10:30 was
  // full, and the earliest a machine was actually ready was 11:15.
  const slots = generateSlotsForDay().map((time) => ({
    time,
    remaining: Math.max(0, MAX_CAPACITY_PER_SLOT - machinesBusyAt(seats, time)),
  }));

  return NextResponse.json({ slots });
}
