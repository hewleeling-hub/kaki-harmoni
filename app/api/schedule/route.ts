import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { occupancyForDate } from "@/lib/capacity";
import { generateSlotsForDay, remainingFor, isClosedDate, MAX_CAPACITY_PER_SLOT } from "@/lib/slots";

// GET /api/schedule?date=YYYY-MM-DD — one day's slots with who is booked in
// each, plus the week around it (staff only).
//
// The staff counterpart of /api/slots. That route is public and says only how
// many places are left; this one names the guests, so it sits behind the staff
// check and reads with the service-role client. Free places come from the same
// occupancy arithmetic the customer calendar uses, so what staff see here is
// exactly what a customer would be offered.

const ISO = /^\d{4}-\d{2}-\d{2}$/;

type Booking = {
  id: string;
  name: string | null;
  phone: string | null;
  customer_no: number | null;
  product_name: string | null;
  status: string | null;
  visit_status: string | null;
};

/** Monday-to-Sunday dates of the week containing `date`, as plain ISO strings. */
function weekOf(date: string): string[] {
  const d = new Date(`${date}T00:00:00Z`);
  const sinceMonday = (d.getUTCDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d.getTime() + (i - sinceMonday) * 86_400_000);
    return day.toISOString().slice(0, 10);
  });
}

export async function GET(request: NextRequest) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Staff only." }, { status: 401 });

  const date = request.nextUrl.searchParams.get("date");
  if (!date || !ISO.test(date)) {
    return NextResponse.json({ error: "A valid date is required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const week = weekOf(date);

  // One read for the whole week: the day's bookings and the strip's counts.
  const { data: weekRows, error } = await admin
    .from("purchases")
    .select("id, signup_id, booking_date, booking_time, product_name, status, visit_status")
    .gte("booking_date", week[0])
    .lte("booking_date", week[6]);
  if (error) return NextResponse.json({ error: "Could not load the schedule." }, { status: 500 });

  const counts = new Map<string, number>();
  for (const r of weekRows ?? []) {
    const d = r.booking_date as string;
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }

  const dayRows = (weekRows ?? []).filter((r) => r.booking_date === date);
  const signupIds = [...new Set(dayRows.map((r) => r.signup_id as string).filter(Boolean))];
  const { data: signups } = signupIds.length
    ? await admin.from("signups").select("id, name, phone, customer_no").in("id", signupIds)
    : { data: [] };
  const who = new Map((signups ?? []).map((s) => [s.id as string, s]));

  const toBooking = (r: (typeof dayRows)[number]): Booking => {
    const s = who.get(r.signup_id as string);
    return {
      id: r.id as string,
      name: (s?.name as string | undefined) ?? null,
      phone: (s?.phone as string | undefined) ?? null,
      customer_no: (s?.customer_no as number | undefined) ?? null,
      product_name: (r.product_name as string | null) ?? null,
      status: (r.status as string | null) ?? null,
      visit_status: (r.visit_status as string | null) ?? null,
    };
  };

  const occupancy = await occupancyForDate(admin, date);
  const times = generateSlotsForDay(date);
  const hhmm = (t: unknown) => (typeof t === "string" ? t.slice(0, 5) : null);

  const slots = times.map((time) => ({
    time,
    remaining: remainingFor(occupancy, time, 1),
    bookings: dayRows.filter((r) => hhmm(r.booking_time) === time).map(toBooking),
  }));

  // A booking whose time is not on the grid (an odd time, or a booking on a day
  // now closed) must not vanish from the screen just because no slot matches it.
  const known = new Set(times);
  const other = dayRows.filter((r) => r.booking_time && !known.has(hhmm(r.booking_time) ?? "")).map(toBooking);
  const undated = dayRows.filter((r) => !r.booking_time).map(toBooking);

  return NextResponse.json({
    date,
    closed: isClosedDate(date),
    capacity: MAX_CAPACITY_PER_SLOT,
    slots,
    other,
    undated,
    week: week.map((d) => ({ date: d, count: counts.get(d) ?? 0, closed: isClosedDate(d) })),
  });
}
