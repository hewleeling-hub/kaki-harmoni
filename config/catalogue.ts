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
 * ── LAUNCH SWITCH ────────────────────────────────────────────────────────────
 * Packages are advertised but not sold online yet. Kaki Harmoni opens on
 * 11 September and the multi-visit checkout wasn't ready in time, so launch
 * sells the two single visits only: First Soak (RM25) and Single Soak (RM40).
 *
 * NOTHING was deleted to do this. The whole ladder — the ?option= plumbing, the
 * prepay-only rule, the preselect — is intact and covered by the code below.
 * To switch packages back on, BOTH of these must happen together:
 *   1. reactivate the four package rows (revert 0012_first_soak_only.sql), and
 *   2. flip this to true.
 * Doing only (1) leaves the CTAs pointing at /#reserve; doing only (2) sends
 * customers to a checkout that can't sell them what they clicked.
 */
export const PACKAGES_ON_SALE = false;

/** The slugs gated by PACKAGES_ON_SALE. Singles are always sellable. */
const PACKAGE_SLUGS: CatalogueSlug[] = [
  "double-reset",
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
 * Whether a package must be prepaid, or may be settled on arrival like a
 * single visit.
 *
 * FALSE, because packages are signed up for at the shop and paid there — the
 * site's own copy says "book your first session online and pay at the shop",
 * and refusing pay-at-the-door in checkout would contradict it.
 *
 * The argument for true is real and worth keeping in view: an unpaid RM840
 * routine that no-shows costs far more than an unpaid RM30 first visit. If
 * packages ever go on sale online AND no-shows become a problem, flip this
 * back — one switch, read by both the checkout form and POST /api/purchases,
 * so the two can't disagree.
 */
export const PACKAGES_ARE_PREPAY_ONLY = false;

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
