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
  "double-reset": "c0000000-0000-0000-0000-000000000006",
  "five-day-reset": "c0000000-0000-0000-0000-000000000005",
  "ten-day-reset": "c0000000-0000-0000-0000-000000000007",
  "thirty-day-routine": "c0000000-0000-0000-0000-000000000008",
} as const;

export type CatalogueSlug = keyof typeof CATALOGUE_PRODUCT_IDS;

/** True for a slug this file knows, so a hand-typed `?option=` can be ignored. */
export function isCatalogueSlug(value: string | null | undefined): value is CatalogueSlug {
  return !!value && Object.prototype.hasOwnProperty.call(CATALOGUE_PRODUCT_IDS, value);
}

/** Product id for a slug, or null for anything unrecognised. */
export function productIdForSlug(value: string | null | undefined): string | null {
  return isCatalogueSlug(value) ? CATALOGUE_PRODUCT_IDS[value] : null;
}

/**
 * Homepage reserve form, with the chosen option carried along. The query has to
 * come BEFORE the hash or the browser treats it as part of the fragment.
 */
export function reserveHref(slug?: CatalogueSlug): string {
  return slug ? `/?option=${slug}#reserve` : "/#reserve";
}

/** Appends `?option=…` to a booking-flow URL, when one is being carried. */
export function withOption(path: string, slug: string | null | undefined): string {
  return isCatalogueSlug(slug) ? `${path}${path.includes("?") ? "&" : "?"}option=${slug}` : path;
}

/**
 * Packages are prepay-only. Pay-at-the-door is a sensible option on a RM30
 * first visit; carrying an unpaid RM840 booking through to the day is a real
 * loss if the guest doesn't turn up. Enforced on the server too — the client
 * simply doesn't offer the choice.
 */
export const PACKAGES_ARE_PREPAY_ONLY = true;
