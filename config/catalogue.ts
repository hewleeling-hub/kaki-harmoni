/**
 * The bridge between site copy and the sellable catalogue.
 *
 * `config/business.ts` owns what the site SAYS (names, prices, positioning).
 * The `products` table owns what a customer can actually PAY for. They drifted
 * once already — the 5-visit package was seeded at RM180 while /prices
 * advertised RM160 — so this file is the one place that couples them, and the
 * ids below are the deterministic series from `0006_catalogue.sql` /
 * `0009_full_catalogue.sql`. Change a price in one place and change it in both.
 *
 * The slugs are what travel through the booking flow as `?option=…`, so that
 * clicking "MAKE IT MY ROUTINE" on /prices actually lands the customer in
 * checkout with the 30-Day Routine already chosen, rather than in the RM25
 * first-visit basket every ladder CTA used to share.
 */

export const CATALOGUE_PRODUCT_IDS = {
  "first-soak": "c0000000-0000-0000-0000-000000000001",
  "single-soak": "c0000000-0000-0000-0000-000000000002",
  "five-day-reset": "c0000000-0000-0000-0000-000000000005",
  "ten-day-reset": "c0000000-0000-0000-0000-000000000007",
  "thirty-day-routine": "c0000000-0000-0000-0000-000000000008",
} as const;

export type CatalogueSlug = keyof typeof CATALOGUE_PRODUCT_IDS;

/**
 * How many soaks one unit of this product uses IN A SINGLE VISIT.
 *
 * EMPTY TODAY, and kept rather than deleted. Its only entry was the Double
 * Reset, which has been withdrawn; everything now on sale uses one machine, so
 * soaksForProductId() falls through to 1 for all of them and the capacity
 * check behaves exactly as it did.
 *
 * The mechanism is what is worth keeping. "Two soaks back to back" is one
 * appointment, not two bookings, and it cannot be one machine used twice —
 * a machine has to stand for 30 minutes between runs — so it occupies a
 * second machine starting as the first soak ends. Any future product that
 * does that belongs here, or it will be sold into a slot that cannot hold it.
 *
 * The multi-visit packages do NOT belong here. A 5-Day Reset is five separate
 * appointments on five separate days; booking it holds one slot for the first
 * of them, so it uses one machine like any other single visit. Putting 5 here
 * would block the whole shop for one customer.
 */
const SOAKS_PER_UNIT: Partial<Record<CatalogueSlug, number>> = {};

// Typed as plain strings on the key side: product ids arrive from the database
// and from request bodies, not as the literal union this object infers.
const SLUG_BY_PRODUCT_ID = new Map<string, CatalogueSlug>(
  Object.entries(CATALOGUE_PRODUCT_IDS).map(([slug, id]) => [id as string, slug as CatalogueSlug]),
);

/** Soaks per unit for a product id — 1 for anything unrecognised. */
export function soaksForProductId(productId: string | null | undefined): number {
  const slug = productId ? SLUG_BY_PRODUCT_ID.get(productId) : undefined;
  return (slug && SOAKS_PER_UNIT[slug]) || 1;
}

/** Soaks per unit for a slug — used when availability is checked before checkout. */
export function soaksForSlug(value: string | null | undefined): number {
  return (isCatalogueSlug(value) && SOAKS_PER_UNIT[value]) || 1;
}

/** True for a slug this file knows, so a hand-typed `?option=` can be ignored. */
export function isCatalogueSlug(value: string | null | undefined): value is CatalogueSlug {
  return !!value && Object.prototype.hasOwnProperty.call(CATALOGUE_PRODUCT_IDS, value);
}

/** Product id for a slug, or null for anything unrecognised. */
export function productIdForSlug(value: string | null | undefined): string | null {
  return isCatalogueSlug(value) ? CATALOGUE_PRODUCT_IDS[value] : null;
}

/**
 * ── LAUNCH SWITCH ────────────────────────────────────────────────────────────
 * The full ladder is bookable: First Soak (RM25), Single Soak (RM40), Double
 * Reset (RM68), 5-Day (RM160), 10-Day (RM300), 30-Day Routine (RM840).
 *
 * Booking a package online holds the slot ONLY — it is settled and set up at
 * the counter, see PACKAGES_ARE_DOOR_ONLY below for why that is the shape and
 * not a limitation to route around.
 *
 * This travels with the package rows in `products`. Both must agree: true here
 * with the rows inactive sends customers to a checkout that can't sell what
 * they clicked, and false with the rows active leaves every ladder CTA
 * pointing at a bare /#reserve.
 *
 * OFF since 28 Oct 2026, for the 11.11 promotion: the three package rows are
 * set inactive, which is what actually removes them from the checkout picker
 * (that list is built from `active = true`, not from this flag — the flag
 * governs CTAs and copy). The ladder still SHOWS the packages, because they
 * are still sold at the counter; their buttons now fall back to a plain
 * reserve link rather than a checkout that would not list them.
 *
 * To put them back: true here AND reactivate the rows. One without the other
 * is the mismatch this comment warns about.
 */
export const PACKAGES_ON_SALE = false;

/**
 * Packages are settled AT THE SHOP, never prepaid online. Booking one online
 * reserves the slot; the money and the package itself are set up at the
 * counter.
 *
 * This is the deliberate answer to the one thing the app cannot do: a package
 * is several visits, and there is no table of visit credits — `purchases`,
 * `order_items` and `signups` are all there is. Taking RM68 or RM840 online
 * would record a single booking and leave every later visit untracked, with
 * the customer's receipt in the app saying nothing about what they are still
 * owed.
 *
 * Paying in person puts the tracking where it can actually happen: a member of
 * staff takes the money, sets the package up however the shop records it, and
 * the guest leaves knowing what they have bought. The app's job stops at
 * holding the first slot.
 *
 * The cost is an unpaid no-show, and on a 30-Day Routine that is RM840 of
 * nobody arriving. Watch it. If it starts hurting, the fix is credit tracking
 * and then prepayment — not prepayment on its own, which would only move the
 * problem to the customer.
 */
export const PACKAGES_ARE_DOOR_ONLY = true;

/** The slugs gated by PACKAGES_ON_SALE. Singles are always sellable. */
const PACKAGE_SLUGS: CatalogueSlug[] = [
  "five-day-reset",
  "ten-day-reset",
  "thirty-day-routine",
];

/** Can a customer actually buy this today? Drives both CTAs and copy. */
export function isOnSale(slug: CatalogueSlug): boolean {
  return PACKAGES_ON_SALE || !PACKAGE_SLUGS.includes(slug);
}

/**
 * Homepage reserve form, with the chosen option carried along. The query has to
 * come BEFORE the hash or the browser treats it as part of the fragment.
 *
 * A slug that isn't on sale drops back to the plain reserve link rather than
 * preselecting something checkout can't offer — that mismatch is exactly what
 * made "I picked the 5-day bundle but it still shows 1 visit" happen.
 */
export function reserveHref(slug?: CatalogueSlug): string {
  return slug && isOnSale(slug) ? `/?option=${slug}#reserve` : "/#reserve";
}

/** Appends `?option=…` to a booking-flow URL, when one is being carried. */
export function withOption(path: string, slug: string | null | undefined): string {
  return isCatalogueSlug(slug) ? `${path}${path.includes("?") ? "&" : "?"}option=${slug}` : path;
}

/**
 * The discounted first visit, which is exactly that: a first visit. It is an
 * acquisition offer priced below the RM40 standard single, so a guest may take
 * it once and once only. Anyone with a booking already on file is offered the
 * rest of the catalogue instead.
 *
 * "Already a customer" is ANY prior purchase row, not a paid one — a booking
 * made and not yet settled has still used the offer up, or the same person
 * could claim RM25 repeatedly by never completing payment.
 */
export const FIRST_VISIT_PRODUCT_ID = CATALOGUE_PRODUCT_IDS["first-soak"];
