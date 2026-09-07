import type { createAdminClient } from "@/lib/supabase/admin";
import { addToOccupancy, type Occupancy } from "@/lib/slots";
import { soaksForProductId } from "@/config/catalogue";

/**
 * Which machines are occupied, minute by minute, across a given date.
 *
 * This has been wrong twice, in the same direction both times — treating a
 * booking as smaller than it really is:
 *
 *  1. Counted in BOOKINGS, not people. A party of three arrived as one row, so
 *     a slot holding four guests looked half empty and the site would sell two
 *     more places into it. That is how 11 September ended up with five people
 *     in four stations.
 *
 *  2. Counted as ONE MACHINE FOR 15 MINUTES. A machine has to stand for 30
 *     minutes after each soak, so one guest holds one machine for 45 — and a
 *     Double Reset is two soaks back to back, which no single machine can do,
 *     so it holds TWO.
 *
 * So occupancy is built from the real shape of each booking: `order_items`
 * gives the product and the quantity, `soaksForProductId` says how many
 * machines one unit needs, and lib/slots turns that into occupied minutes.
 *
 * A purchase with no line items — the legacy shape from before migration
 * 0006 — counts as one person having one soak rather than zero, so an old
 * booking can never silently vanish from the count.
 *
 * Server-only: it takes the admin client. The arithmetic lives in lib/slots.ts
 * so that file stays safe to import from client components.
 */
export async function occupancyForDate(
  supabase: ReturnType<typeof createAdminClient>,
  date: string,
): Promise<Occupancy> {
  const occupancy: Occupancy = new Map();

  const { data: bookings } = await supabase
    .from("purchases")
    .select("id, booking_time")
    .eq("booking_date", date);

  const rows = (bookings ?? []).filter((b) => b.booking_time);
  if (rows.length === 0) return occupancy;

  const { data: items } = await supabase
    .from("order_items")
    .select("purchase_id, product_id, quantity")
    .in(
      "purchase_id",
      rows.map((b) => b.id as string),
    );

  const linesByPurchase = new Map<string, { product_id: string | null; quantity: number }[]>();
  for (const item of items ?? []) {
    const id = item.purchase_id as string;
    const lines = linesByPurchase.get(id) ?? [];
    lines.push({
      product_id: (item.product_id as string | null) ?? null,
      quantity: Number(item.quantity ?? 1),
    });
    linesByPurchase.set(id, lines);
  }

  for (const booking of rows) {
    const time = booking.booking_time as string;
    const lines = linesByPurchase.get(booking.id as string);

    if (!lines || lines.length === 0) {
      addToOccupancy(occupancy, time, 1, 1);
      continue;
    }

    for (const line of lines) {
      // Add-ons — an extra coffee — occupy no machine.
      const soaks = soaksForProductId(line.product_id);
      addToOccupancy(occupancy, time, soaks, Math.max(1, line.quantity));
    }
  }

  return occupancy;
}
