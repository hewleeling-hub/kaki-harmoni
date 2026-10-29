import type { createAdminClient } from "@/lib/supabase/admin";
import { isVoucherProduct, activeVoucherOffer, ELEVEN_ELEVEN } from "@/config/promotions";

/**
 * Turning a request's items into priced order lines.
 *
 * Lifted out of /api/purchases so it can be tested without a database: it
 * takes the Supabase client as an argument, so a stub is enough to exercise
 * the rules that actually matter here — one main item per order, prices read
 * from the catalogue and never from the request, and how many of a thing an
 * order may contain.
 */

// Legacy default used when no items are sent or the catalogue isn't available yet.
const DEFAULT_ITEM_NAME = "First Visit — Foot Soak";
const DEFAULT_ITEM_PRICE_MYR = 25.0;

export type ResolvedLine = {
  product_id: string | null;
  product_name: string;
  category: string;
  quantity: number;
  unit_price_myr: number;
  line_total_myr: number;
};

/** Services and packages are the thing being bought; add-ons ride along. */
export const isMainCategory = (category: string) => category === "service" || category === "package";

/**
 * How many of one main item a single order may contain.
 *
 * One for everything that is a VISIT: one booking holds one place in the slot,
 * and the FAQ tells a pair to book a soak each.
 *
 * The voucher is not a visit — it is a prepaid credit with a redeem-by date,
 * and the poster sells up to two of them per person. Buying two means paying
 * RM22 now and owing two soaks, one of which may be booked into today's slot
 * and the other taken any time before it expires. Capped at the offer's own
 * limit, so this can never exceed what the cap would allow anyway.
 */
export function maxQuantityFor(productId: string | null): number {
  if (!isVoucherProduct(productId)) return 1;
  return (activeVoucherOffer() ?? ELEVEN_ELEVEN).maxPerPerson;
}

// Resolve requested items against the catalogue, pricing every line from the DB
// (never trusting client-sent prices). Falls back to the legacy single item.
//
// The shape is enforced here, not just in the form: exactly one main item,
// at quantity 1 unless it is a voucher (see maxQuantityFor), plus any number
// of add-ons at 1–20.
export async function resolveLines(
  supabase: ReturnType<typeof createAdminClient>,
  items: { product_id?: string; quantity?: number }[] | undefined,
): Promise<ResolvedLine[]> {
  const requested = (items ?? []).filter(
    (i) => i.product_id && (i.quantity ?? 0) > 0,
  );

  if (requested.length > 0) {
    const ids = requested.map((i) => i.product_id as string);
    const { data: products } = await supabase
      .from("products")
      .select("id, name, price_myr, active, category")
      .in("id", ids);

    if (products && products.length > 0) {
      const byId = new Map(products.map((p) => [p.id, p]));
      const lines: ResolvedLine[] = [];
      let mainTaken = false;

      for (const req of requested) {
        const p = byId.get(req.product_id as string);
        if (!p || p.active === false) continue;

        const category = String(p.category ?? "service");
        const main = isMainCategory(category);
        // Ignore a second main item rather than silently charging for both.
        if (main && mainTaken) continue;
        if (main) mainTaken = true;

        const ceiling = main ? maxQuantityFor(p.id) : 20;
        const quantity = Math.min(
          Math.max(Math.floor(req.quantity as number), 1),
          ceiling,
        );
        const unit = Number(p.price_myr);
        lines.push({
          product_id: p.id,
          product_name: p.name,
          category,
          quantity,
          unit_price_myr: unit,
          line_total_myr: Math.round(unit * quantity * 100) / 100,
        });
      }
      // Add-ons alone are not a booking — fall through to the default visit.
      if (mainTaken) return lines;
    }
  }

  // Fallback: legacy single first-visit item.
  return [
    {
      product_id: null,
      product_name: DEFAULT_ITEM_NAME,
      category: "service",
      quantity: 1,
      unit_price_myr: DEFAULT_ITEM_PRICE_MYR,
      line_total_myr: DEFAULT_ITEM_PRICE_MYR,
    },
  ];
}

export function summarise(lines: ResolvedLine[]): string {
  if (lines.length === 1) {
    const l = lines[0];
    return l.quantity > 1 ? `${l.quantity}× ${l.product_name}` : l.product_name;
  }
  return `${lines[0].product_name} +${lines.length - 1} more`;
}

