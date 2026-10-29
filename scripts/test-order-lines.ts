import { resolveLines, maxQuantityFor, summarise } from "@/lib/order-lines";
import { ELEVEN_ELEVEN } from "@/config/promotions";
import { CATALOGUE_PRODUCT_IDS } from "@/config/catalogue";

const V = ELEVEN_ELEVEN.productId;
const SINGLE = CATALOGUE_PRODUCT_IDS["single-soak"];
const PKG = CATALOGUE_PRODUCT_IDS["thirty-day-routine"];

/* A stub standing in for the products table. The real one is unreachable from
   this container, and these rules do not depend on it being real — only on
   what a row says. Prices here match the live catalogue. */
const CATALOGUE: Record<string, { id: string; name: string; price_myr: number; active: boolean; category: string }> = {
  [V]:      { id: V,      name: "11.11 Foot Spa Voucher", price_myr: 11, active: true, category: "service" },
  [SINGLE]: { id: SINGLE, name: "Single Soak",            price_myr: 40, active: true, category: "service" },
  [PKG]:    { id: PKG,    name: "30-Day Routine",         price_myr: 840, active: true, category: "package" },
};

const stub = {
  from: () => ({
    select: () => ({
      in: (_col: string, ids: string[]) => ({
        data: ids.map((i) => CATALOGUE[i]).filter(Boolean),
      }),
    }),
  }),
} as unknown as Parameters<typeof resolveLines>[0];

let fails = 0;
const ok = (label: string, cond: boolean, extra = "") => {
  if (!cond) fails++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? "  → " + extra : ""}`);
};

async function main() {
  ok("voucher may be bought in twos", maxQuantityFor(V) === 2, String(maxQuantityFor(V)));
  ok("a single soak may not", maxQuantityFor(SINGLE) === 1, String(maxQuantityFor(SINGLE)));
  ok("a package may not", maxQuantityFor(PKG) === 1, String(maxQuantityFor(PKG)));

  const one = await resolveLines(stub, [{ product_id: V, quantity: 1 }]);
  ok("1 voucher → RM11", one[0].line_total_myr === 11 && one[0].quantity === 1, JSON.stringify(one[0]));

  const two = await resolveLines(stub, [{ product_id: V, quantity: 2 }]);
  ok("2 vouchers → RM22", two[0].line_total_myr === 22 && two[0].quantity === 2, JSON.stringify(two[0]));
  ok("2 vouchers read as '2× …'", summarise(two) === "2× 11.11 Foot Spa Voucher", summarise(two));

  const three = await resolveLines(stub, [{ product_id: V, quantity: 3 }]);
  ok("3 vouchers CLAMPED to 2 (cap is 2)", three[0].quantity === 2 && three[0].line_total_myr === 22, JSON.stringify(three[0]));

  const ninetynine = await resolveLines(stub, [{ product_id: V, quantity: 99 }]);
  ok("99 vouchers clamped to 2", ninetynine[0].quantity === 2, String(ninetynine[0].quantity));

  const twoSoaks = await resolveLines(stub, [{ product_id: SINGLE, quantity: 2 }]);
  ok("2 single soaks still forced to 1 (one slot, one place)",
     twoSoaks[0].quantity === 1 && twoSoaks[0].line_total_myr === 40, JSON.stringify(twoSoaks[0]));

  const twoPkg = await resolveLines(stub, [{ product_id: PKG, quantity: 2 }]);
  ok("2 packages forced to 1", twoPkg[0].quantity === 1, String(twoPkg[0].quantity));

  // Price must come from the catalogue, never the request.
  const lying = await resolveLines(stub, [{ product_id: V, quantity: 2, unit_price_myr: 0 } as never]);
  ok("a request cannot set its own price", lying[0].unit_price_myr === 11, String(lying[0].unit_price_myr));

  // Two main items: the second is ignored, not charged.
  const twoMains = await resolveLines(stub, [{ product_id: V, quantity: 2 }, { product_id: SINGLE, quantity: 1 }]);
  ok("a second main item is dropped", twoMains.length === 1 && twoMains[0].product_id === V,
     JSON.stringify(twoMains.map((l) => l.product_name)));

  console.log(fails ? `\n${fails} FAILED` : "\nall passed");
  process.exit(fails ? 1 : 0);
}
main();
