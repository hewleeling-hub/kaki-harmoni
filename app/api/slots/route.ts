import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSlotsForDay, MAX_CAPACITY_PER_SLOT } from "@/lib/slots";
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

  const slots = generateSlotsForDay().map((time) => ({
    time,
    remaining: Math.max(0, MAX_CAPACITY_PER_SLOT - (seats[time] ?? 0)),
  }));

  return NextResponse.json({ slots });
}
