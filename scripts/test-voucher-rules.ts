import { ELEVEN_ELEVEN, isVoucherProduct, activeVoucherOffer, voucherBuyHref } from "@/config/promotions";
import { productIdForSlug, isCatalogueSlug } from "@/config/catalogue";
import { refuseVoucherClaim } from "@/lib/vouchers";
import { offerForSlug } from "@/config/business";

let fails = 0;
const ok = (label: string, cond: boolean, extra = "") => {
  if (!cond) fails++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? "  → " + extra : ""}`);
};

const V = ELEVEN_ELEVEN.productId;

// ── the slug now routes through the normal funnel ──────────────────────────
ok("'eleven-eleven' is a catalogue slug", isCatalogueSlug("eleven-eleven"));
ok("slug resolves to the voucher product", productIdForSlug("eleven-eleven") === V, String(productIdForSlug("eleven-eleven")));
ok("buy href enters the booking form", voucherBuyHref(ELEVEN_ELEVEN) === "/?option=eleven-eleven#reserve", voucherBuyHref(ELEVEN_ELEVEN));
ok("signup form can name the voucher", offerForSlug("eleven-eleven" as never)?.name === ELEVEN_ELEVEN.title, JSON.stringify(offerForSlug("eleven-eleven" as never)));
ok("voucher product is recognised", isVoucherProduct(V));
ok("offer is on sale today", !!activeVoucherOffer());

// ── the cap must reason about the real quantity ────────────────────────────
const allow = (held: number) => ({
  offer: ELEVEN_ELEVEN, held, remaining: Math.max(0, 2 - held), max: 2, countable: true,
});
ok("holds 0, wants 2 → allowed", refuseVoucherClaim({ offer: ELEVEN_ELEVEN, allowance: allow(0), wanted: 2, onSale: true }) === null);
ok("holds 1, wants 2 → refused 'too_many'",
   refuseVoucherClaim({ offer: ELEVEN_ELEVEN, allowance: allow(1), wanted: 2, onSale: true })?.reason === "too_many");
ok("holds 1, wants 1 → allowed", refuseVoucherClaim({ offer: ELEVEN_ELEVEN, allowance: allow(1), wanted: 1, onSale: true }) === null);
ok("holds 2, wants 1 → refused 'cap_reached'",
   refuseVoucherClaim({ offer: ELEVEN_ELEVEN, allowance: allow(2), wanted: 1, onSale: true })?.reason === "cap_reached");
ok("uncountable → refused",
   refuseVoucherClaim({ offer: ELEVEN_ELEVEN, allowance: { ...allow(0), countable: false }, wanted: 1, onSale: true })?.reason === "not_countable");
ok("sale closed → refused",
   refuseVoucherClaim({ offer: ELEVEN_ELEVEN, allowance: allow(0), wanted: 1, onSale: false })?.reason === "sale_closed");

console.log(fails ? `\n${fails} FAILED` : "\nall passed");
process.exit(fails ? 1 : 0);
