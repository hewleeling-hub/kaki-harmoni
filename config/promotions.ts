/**
 * One-day and short-run promotions.
 *
 * DATE-DRIVEN, NOT A SWITCH. A one-day offer that needs a person to remember to
 * take it down is still on the site in October, quoting a price the shop no
 * longer honours. These appear and disappear on their own; the only way to be
 * wrong is to get the dates wrong, which is visible here in one place.
 *
 * Times are stored as UTC instants rather than local dates, because the site
 * renders on servers running UTC while the shop lives in Kuala Lumpur (+08:00,
 * no daylight saving). Writing "2026-09-16" and comparing it to a server clock
 * is how a Malaysia Day offer disappears at 8am on the day it runs.
 */

export interface Promotion {
  id: string;
  /**
   * The day it runs, as a booking date (yyyy-mm-dd, Kuala Lumpur).
   *
   * Separate from the instants below on purpose: those decide when the site
   * ADVERTISES the offer, this decides which booking date the offer IS. They
   * answer different questions and conflating them is how an offer stays
   * bookable after it has stopped being advertised.
   */
  dateISO: string;
  /**
   * The catalogue row this offer sells. On its day this is the only thing
   * bookable, so the price a customer pays still comes from the products table
   * like every other line — never from the copy above.
   */
  productId: string;
  /** Short label for the coloured pill. */
  badge: string;
  /** The headline. Kept to the words on the poster. */
  title: string;
  /** The price, as it appears on the poster. */
  price: string;
  /** What the price includes, one item per chip. */
  includes: string[];
  /** The line under the headline — the poster's own words. */
  line: string;
  /** When the offer actually runs, in plain words, for the terms line. */
  whenLabel: string;
  /** Visible from this instant. */
  showsFrom: Date;
  /** Hidden from this instant — the moment the offer stops being true. */
  endsAt: Date;
}

/**
 * Malaysia Day, 16 September 2026. One day only.
 *
 * Ends at 2026-09-16T16:00:00Z, which is midnight at the end of the 16th in
 * Kuala Lumpur. Not 00:00Z on the 16th, which would be 8am local and would pull
 * the offer off the site while the shop was still honouring it.
 */
export const MALAYSIA_DAY: Promotion = {
  id: "malaysia-day-2026",
  dateISO: "2026-09-16",
  productId: "c0000000-0000-0000-0000-000000000009",
  badge: "16 September only",
  title: "Malaysia Day Harmoni",
  price: "RM33",
  includes: ["Foot relaxation soak", "Any drink", "A slice of cake, free"],
  line: "A little time for you. A big love for Malaysia.",
  whenLabel: "Wednesday 16 September 2026, open 10:00am – 8:00pm",
  showsFrom: new Date("2026-09-13T16:00:00Z"), // 14 Sept, midnight in KL
  endsAt: new Date("2026-09-16T16:00:00Z"), // midnight at the end of the 16th, KL
};

const ALL: Promotion[] = [MALAYSIA_DAY];

/**
 * The promotion to show right now, or null.
 *
 * Takes `now` so the behaviour can be tested at a chosen instant rather than
 * only on the day — a one-day offer is otherwise untestable until it is too
 * late to fix.
 */
export function activePromotion(now: Date = new Date()): Promotion | null {
  return ALL.find((p) => now >= p.showsFrom && now < p.endsAt) ?? null;
}

/**
 * The day normal pricing comes back, in words — the day after the offer.
 *
 * Derived rather than written down, so moving the offer's date can't leave the
 * site promising a resumption on a day that no longer follows it. Formatted in
 * UTC because `dateISO` is a calendar date, not an instant: letting the server's
 * zone interpret it would shift the label by a day either side of midnight.
 */
export function resumesLabel(promo: Promotion): string {
  const next = new Date(`${promo.dateISO}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Whether the offer runs today, for copy that says "today" rather than a date. */
export function isRunningToday(promo: Promotion, now: Date = new Date()): boolean {
  const dayStart = new Date(promo.endsAt.getTime() - 24 * 60 * 60 * 1000);
  return now >= dayStart && now < promo.endsAt;
}

/**
 * The offer that OWNS a booking date, or null.
 *
 * On its day nothing else is bookable — not the RM25 first visit, not a
 * package. This is what both the checkout screen and the purchases API ask, so
 * the menu a customer sees and the rule the server enforces cannot drift apart.
 *
 * Deliberately not time-bounded like activePromotion: a date either is Malaysia
 * Day or it isn't, regardless of when someone happens to be looking.
 */
export function promotionForBookingDate(dateISO: string | null | undefined): Promotion | null {
  if (!dateISO) return null;
  return ALL.find((p) => p.dateISO === dateISO) ?? null;
}

/** Is this product one that only exists for a promotion day? */
export function isPromotionProduct(productId: string | null | undefined): boolean {
  return !!productId && ALL.some((p) => p.productId === productId);
}
