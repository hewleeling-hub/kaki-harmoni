import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSlotsForDay, MAX_CAPACITY_PER_SLOT } from "@/lib/slots";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "A valid date is required." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: bookings, error } = await supabase
    .from("purchases")
    .select("booking_time")
    .eq("booking_date", date);

  if (error) {
    return NextResponse.json({ error: "Could not load availability." }, { status: 500 });
  }

  const counts: Record<string, number> = {};
  (bookings ?? []).forEach((b) => {
    if (b.booking_time) counts[b.booking_time] = (counts[b.booking_time] ?? 0) + 1;
  });

  const slots = generateSlotsForDay().map((time) => ({
    time,
    remaining: Math.max(0, MAX_CAPACITY_PER_SLOT - (counts[time] ?? 0)),
  }));

  return NextResponse.json({ slots });
}
