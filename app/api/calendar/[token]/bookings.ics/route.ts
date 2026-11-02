import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildCalendar, type IcsBooking } from "@/lib/ics";

// GET /api/calendar/<token>/bookings.ics — the bookings as a calendar feed.
//
// A phone's calendar app cannot sign in, so the address itself is the secret:
// CALENDAR_FEED_TOKEN in the environment. Unset, or shorter than a guessable
// length, and the feed does not exist — a missing secret must never become an
// open feed. A wrong token gets the same 404 as no feed at all, so the address
// cannot be probed.
//
// Read-only and names-only; see lib/ics.ts for what an event contains.

const MIN_TOKEN_LENGTH = 24;

function tokenMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const expected = process.env.CALENDAR_FEED_TOKEN ?? "";
  if (expected.length < MIN_TOKEN_LENGTH || !tokenMatches(token, expected)) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Thirty days back, and everything ahead: enough history to look at last week,
  // not the whole of time.
  const since = new Date(Date.now() - 30 * 86_400_000).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
  });

  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("purchases")
    .select("id, signup_id, booking_date, booking_time, product_name")
    .gte("booking_date", since)
    .not("booking_time", "is", null)
    .order("booking_date", { ascending: true });
  if (error) {
    // Logged: a calendar app only ever sees "failed", so the cause lives here.
    console.error("calendar feed: could not load bookings:", error.message);
    return new NextResponse("Could not load bookings", { status: 500 });
  }

  const ids = [...new Set((rows ?? []).map((r) => r.signup_id as string).filter(Boolean))];
  const { data: people } = ids.length
    ? await admin.from("signups").select("id, name").in("id", ids)
    : { data: [] };
  const names = new Map((people ?? []).map((p) => [p.id as string, p.name as string | null]));

  const bookings: IcsBooking[] = (rows ?? []).map((r) => ({
    id: r.id as string,
    date: r.booking_date as string,
    time: r.booking_time as string,
    name: names.get(r.signup_id as string) ?? null,
    product: (r.product_name as string | null) ?? null,
  }));

  return new NextResponse(buildCalendar(bookings), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // A short private cache: calendar apps poll, and the data changes slowly.
      "Cache-Control": "private, max-age=300",
    },
  });
}
