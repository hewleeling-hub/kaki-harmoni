import type { createAdminClient } from "@/lib/supabase/admin";

/**
 * How many PEOPLE are booked into each time slot on a given date.
 *
 * Capacity used to be counted in bookings, which is not what fills a room: one
 * party of three arrived as a single row, so a slot holding four guests looked
 * half empty and the site would happily sell two more places into it. That is
 * exactly what happened to 11 September — Diong's three and Tjeannee's two came
 * to five people in four stations, and the calendar showed room to spare.
 *
 * Seats come from `order_items.quantity`. A purchase with no line items — the
 * legacy shape, from before migration 0006 — counts as one person rather than
 * zero, so an old booking can never silently vanish from the count.
 *
 * Server-only: it takes the admin client, and lives outside lib/slots.ts so
 * that file stays safe to import from client components.
 */
export async function seatsBookedByTime(
  supabase: ReturnType<typeof createAdminClient>,
  date: string,
): Promise<Record<string, number>> {
  const { data: bookings } = await supabase
    .from("purchases")
    .select("id, booking_time")
    .eq("booking_date", date);

  const rows = (bookings ?? []).filter((b) => b.booking_time);
  if (rows.length === 0) return {};

  const { data: items } = await supabase
    .from("order_items")
    .select("purchase_id, quantity")
    .in(
      "purchase_id",
      rows.map((b) => b.id as string),
    );

  // Sum the line quantities per purchase; missing line items mean one person.
  const seatsPerPurchase = new Map<string, number>();
  for (const item of items ?? []) {
    const id = item.purchase_id as string;
    seatsPerPurchase.set(id, (seatsPerPurchase.get(id) ?? 0) + Number(item.quantity ?? 1));
  }

  const byTime: Record<string, number> = {};
  for (const b of rows) {
    const time = b.booking_time as string;
    const seats = seatsPerPurchase.get(b.id as string) ?? 1;
    byTime[time] = (byTime[time] ?? 0) + seats;
  }
  return byTime;
}
