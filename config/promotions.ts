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
  // "free" said of one item inside a single price invites the question of what
  // the other two cost. Everything here is the RM33.
  includes: ["Foot relaxation soak", "Any drink", "A slice of cake"],
  line: "A little time for you. A big love for Malaysia.",
  whenLabel: "Wednesday 16 September 2026",
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

/* ======================================================================
 * VOUCHER OFFERS
 *
 * A different shape from Promotion above, and deliberately a separate type.
 *
 * A Promotion OWNS a booking date: on its day it is the only thing bookable.
 * A voucher is the opposite — it is bought in one window and redeemed in a
 * much longer one, and it must never stop normal bookings. Expressing 11.11
 * as a Promotion would have made 11 November unbookable for everything else,
 * which is the reverse of what a voucher sale is for.
 *
 * Like Promotion, the windows are UTC instants rather than local dates: the
 * site renders on UTC servers while the shop lives in Kuala Lumpur (+08:00).
 * ====================================================================== */

export interface VoucherOffer {
  id: string;
  /** Catalogue row, so the price charged comes from the database, not copy. */
  productId: string;
  badge: string;
  title: string;
  /** The poster is bilingual; the site shows the Chinese line alongside. */
  titleZh?: string;
  /** The price as printed on the poster. */
  price: string;
  /** What that price is per — "per session" on the poster. */
  unit: string;
  /** Exactly what one voucher buys. No more than the poster promises. */
  buys: string;
  /** The purchase cap, enforced at the counter (see the terms note below). */
  maxPerPerson: number;
  /** Sale window. */
  sellFrom: Date;
  sellUntil: Date;
  /**
   * Last day a voucher can be used (yyyy-mm-dd, Kuala Lumpur).
   *
   * Stored onto each voucher row at purchase, so a voucher keeps the terms it
   * was sold under even if a later offer changes them.
   */
  redeemByISO: string;
  /** The same day in words, for the band. */
  redeemByLabel: string;
  /** The last day to buy, in words. */
  sellUntilLabel: string;
}

/**
 * 11.11 Foot Spa Voucher — RM11 a session, bought by 11 November 2026 and used
 * any time up to 31 December 2026. Maximum two per person.
 *
 * sellUntil is 2026-11-11T16:00:00Z, which is midnight at the end of the 11th
 * in Kuala Lumpur — not 00:00Z on the 11th, which is 8am local and would close
 * the sale while the shop was still taking money for it.
 *
 * NOTE ON THE TWO LIMITS: "maximum 2 per person" and "redeem by 31 December"
 * are promises the WEBSITE makes but only the COUNTER keeps. There is no
 * voucher table, no issued codes and no redemption tracking — staff write the
 * voucher number on the paper intake form as they already do. That was a
 * deliberate scope decision to get the offer live inside its sale window. If
 * the offer is repeated, issuing real codes is the thing to build first.
 */
export const ELEVEN_ELEVEN: VoucherOffer = {
  id: "eleven-eleven-2026",
  productId: "c0000000-0000-0000-0000-000000000010",
  badge: "11.11 offer",
  title: "11.11 Foot Spa Voucher",
  titleZh: "足浴优惠券",
  price: "RM11",
  unit: "per session",
  // The poster says "foot spa voucher" and nothing else. It does NOT include a
  // drink, unlike a standard visit, so the copy must not imply one.
  buys: "One 15-minute foot soak.",
  maxPerPerson: 2,
  sellFrom: new Date("2026-10-28T00:00:00Z"),
  sellUntil: new Date("2026-11-11T16:00:00Z"), // midnight ending 11 Nov, KL
  sellUntilLabel: "11 November 2026",
  redeemByISO: "2026-12-31",
  redeemByLabel: "31 December 2026",
};

const VOUCHERS: VoucherOffer[] = [ELEVEN_ELEVEN];

/** The voucher offer on sale right now, or null. Takes `now` so it is testable. */
export function activeVoucherOffer(now: Date = new Date()): VoucherOffer | null {
  return VOUCHERS.find((v) => now >= v.sellFrom && now < v.sellUntil) ?? null;
}

/**
 * Whether today is the last day to buy, for copy that can honestly say so.
 *
 * Derived from sellUntil rather than a written-down date, so moving the sale
 * window cannot leave the site shouting "last day" on the wrong one.
 */
export function isLastDayToBuy(offer: VoucherOffer, now: Date = new Date()): boolean {
  const dayStart = new Date(offer.sellUntil.getTime() - 24 * 60 * 60 * 1000);
  return now >= dayStart && now < offer.sellUntil;
}

/** Whole days left to buy, counting today. Never negative. */
export function daysLeftToBuy(offer: VoucherOffer, now: Date = new Date()): number {
  const ms = offer.sellUntil.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

/**
 * What the persistent nav CTA should say while a voucher offer is on sale.
 *
 * The standing CTA sells the RM30 first visit. During an offer that is the
 * wrong thing for it to be pushing: RM30 competes with the very promotion the
 * page is running, and a nav that argues with the band beneath it costs both.
 * While a voucher is on sale the CTA carries the offer instead, and reverts to
 * RM30 on its own when the window closes — no switch to remember.
 *
 * Returns null when nothing is on sale, which is the signal to use the
 * standing CTA.
 */
export function voucherNavCta(
  now: Date = new Date(),
): { full: string; short: string; tab: string; href: string } | null {
  const offer = activeVoucherOffer(now);
  if (!offer) return null;
  return {
    full: `11.11 Voucher — ${offer.price}`,
    short: `${offer.price} Voucher`,
    tab: `11.11 · ${offer.price}`,
    href: "/#voucher",
  };
}
