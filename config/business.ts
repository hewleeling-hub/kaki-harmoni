/**
 * Kaki Harmoni — customer-site content configuration (single source of truth).
 *
 * All values here are the REAL business facts, drawn from the existing app
 * (lib/whatsapp.ts, lib/config.ts, site-footer, location page). The site is
 * Customers share their details, pick a slot, then pay — payment is what
 * open after launch. Do not invent prices or availability.
 */

import {
  BUSINESS_WHATSAPP_NUMBER,
  BUSINESS_CALL_NUMBER,
  BUSINESS_CALL_DISPLAY,
  whatsAppLink,
} from "@/lib/whatsapp";
import {
  PREPAY_PRICE_MYR,
  WALKIN_PRICE_MYR,
  LAUNCH_WINDOW,
  PRELAUNCH_MODE,
  BOOKING_START_LABEL,
  BOOKING_START_DATE,
} from "@/lib/config";
import { reserveHref, type CatalogueSlug } from "@/config/catalogue";

export const businessConfig = {
  name: "Kaki Harmoni",
  legalName: "AQUAHARMONI SDN BHD",
  ssm: "202601020397",
  tagline: "Relax. Refresh. Reconnect.",

  whatsappNumber: BUSINESS_WHATSAPP_NUMBER, // 60192871799
  callNumber: BUSINESS_CALL_NUMBER, // 60196231799
  callDisplay: BUSINESS_CALL_DISPLAY, // 019-623 1799
  email: "hello@kakiharmoni.com",

  social: {
    instagram: "https://www.instagram.com/kakiharmoni/",
    facebook: "https://facebook.com/KakiHarmoni",
    /**
     * Rednote (Xiaohongshu / 小红书) — a strong fit for this audience, and the
     * only channel here that carries the Chinese-language welcome already on
     * the shopfront.
     *
     * Set to null to withdraw the channel: the footer link and the Contact row
     * both disappear rather than leaving a dead link behind.
     */
    rednote: "https://www.rednote.com/user/profile/6a6323d3000000000e03bc02" as string | null,
  },

  address: {
    name: "Desa Cindaimas Condominium Clubhouse",
    lines: [
      "Desa Cindaimas Condominium Clubhouse",
      "Jalan Sekutu, Taman Gembira",
      "58200 Kuala Lumpur",
    ],
    mapQuery: "Desa Cindaimas Condominium, Kuala Lumpur",
  },

  hours: {
    label: "Open daily",
    display: "10:00am – 8:00pm",
    lastSoak: "Last soak begins at 7:30pm.",
    openHour: 10,
    closeHour: 20,
    timezone: "Asia/Kuala_Lumpur",
  },

  // Real first-visit launch pricing (MYR).
  pricing: {
    prepay: PREPAY_PRICE_MYR, // 25
    walkin: WALKIN_PRICE_MYR, // 30
    normal: 40, // usual first-visit price before launch offer
  },

  prelaunch: PRELAUNCH_MODE,
  launchWindow: LAUNCH_WINDOW, // legacy
  bookingStartLabel: BOOKING_START_LABEL, // "11 September 2026"
  bookingStartDate: BOOKING_START_DATE, // "2026-09-11"
} as const;

/** The four-step visit journey (pre-launch reality). */
export const visitSteps = [
  {
    number: 1,
    title: "Reserve your spot",
    icon: "calendar",
    short: "Pop in your details to get started.",
    long: "Share your name and number to hold your first visit at the launch price.",
  },
  {
    number: 2,
    title: "Pick your time",
    icon: "calendar",
    short: "Choose a slot that suits you.",
    long: `Choose a time slot from the calendar — first visits are from ${businessConfig.bookingStartLabel}.`,
  },
  {
    number: 3,
    title: "Pay to confirm it",
    icon: "gift",
    short: "Your slot is confirmed once you pay.",
    long: `Prepay RM${businessConfig.pricing.prepay} to confirm your slot — or choose to pay RM${businessConfig.pricing.walkin} at the door.`,
  },
  {
    number: 4,
    title: "Relax and reconnect",
    icon: "heart",
    short: "Enjoy a warm 15-minute soak and a coffee.",
    long: "Come in for a warm 15-minute leg soak, a good coffee and a friendly chat.",
  },
] as const;

/** “Good to know before you visit” — no medical claims. */
export const goodToKnow = [
  "Wear comfortable clothing you can roll up past the knees.",
  "Each soak lasts about 15 minutes.",
  "Please arrive five minutes early.",
  "Let our team know if you need any assistance.",
  "Children should be supervised.",
  "Some health conditions may need a word with your doctor before soaking.",
] as const;

/** FAQ content — editable here, rendered by the accordion. */
/**
 * Two soaks back to back. A 15-minute soak is the unit that makes a daily habit
 * easy — it is NOT a cap, and guests who want a longer sit simply stay for a
 * second. Named to sit beside the 5-Day and 10-Day Resets, and worded so it
 * covers one person going twice as well as two people going once.
 *
 * Declared up here, above `faqs`, because the FAQ copy interpolates the name:
 * it had already drifted to a stale "Double + bun & coffee" once.
 */
export const doubleSoak = {
  id: "double-bun-coffee",
  /** Sellable catalogue entry this card buys. */
  slug: "double-reset",
  name: "Double Reset",
  price: 68,
  /** Derived: RM68 for two soaks. Kept out of `detail`, which is reused as prose. */
  perSession: 34,
  detail: "Two soaks, with a bun & coffee on us.",
  /** RM68 against two standard singles at RM40. */
  save: 12,
} as const;

/**
 * Ladder prices, hoisted above `faqs` because the FAQ quotes the per-visit range
 * and `routinePackages` (declared further down) sets the cards. One source, so
 * the two can't drift — the FAQ has already carried stale copy once.
 * The 5-visit price is also the "Buy 4, get 1 free" package: the same product.
 */
export const ladderPrices = { fiveVisit: 160, tenVisit: 300, thirtyVisit: 840 } as const;

/** Cheapest and entry per-visit prices on the ladder, derived — never typed. */
export const ladderPerVisit = {
  entry: ladderPrices.fiveVisit / 5,
  cheapest: ladderPrices.thirtyVisit / 30,
} as const;

/**
 * How long a package stays usable, from the day it's bought. Declared here so
 * the FAQ copy and any future terms read from one value — there was no expiry
 * anywhere in the code before this, so it is a real policy, not a default.
 */
export const packageValidityLabel = "6 months" as const;

export const faqs = [
  {
    q: "When can I visit?",
    a: `Booking is open now — first visits are from ${businessConfig.bookingStartLabel}. Share your details, pick a time slot, then pay to confirm it.`,
  },
  {
    q: "How long is each session?",
    a: `Each warm leg soak lasts about 15 minutes — a simple break that fits into your day. Fancy a longer unwind? You're very welcome to go back to back: many guests enjoy a second soak straight after, or one either side of a coffee break. Our ${doubleSoak.name} is built for exactly that — two soaks, with a bun & coffee on us.`,
  },
  {
    q: "How often should I come?",
    a: "As often as you like — though Kaki Harmoni is really designed around regular visits. It's only fifteen minutes, so many guests find it works best as a small daily habit: a quiet moment before work, or a reset on the way home. Come once first and see how it fits your day.",
  },
  {
    q: "Do I need to live at Desa Cindaimas?",
    a: "Not at all. Kaki Harmoni is inside the Desa Cindaimas clubhouse, but it's open to everyone — you don't need to be a resident. Visitors and walk-ins are always welcome, and there's free parking on site.",
  },
  {
    q: "How much is a visit?",
    a: `Your first visit is RM${businessConfig.pricing.prepay} when you prepay online, or RM${businessConfig.pricing.walkin} at the door — launch prices for our opening period only, after which a first visit is the usual RM${businessConfig.pricing.normal}. A single soak is RM${businessConfig.pricing.normal} after that, or less with a package: from RM${ladderPerVisit.entry} a visit on the 5-Day Reset down to RM${ladderPerVisit.cheapest} on the 30-Day Routine.`,
  },
  {
    q: "Do I pick a time when I book?",
    a: `Yes — you choose your slot from the calendar first, and it's confirmed once your payment goes through. The first available date is ${businessConfig.bookingStartLabel}.`,
  },
  {
    q: "Can I just walk in?",
    a: "Walk-ins are always welcome. That said, we only have four soaking stations, so it can fill up at busier times — booking ahead is advisable to be sure of a spot.",
  },
  {
    q: "What should I wear?",
    a: "Comfortable, everyday clothing is perfect — ideally something you can roll up past the knee, since it's a leg soak. You'll simply roll up when you arrive.",
  },
  {
    q: "Can I come with a friend?",
    a: "Of course — bring a friend or a family member. It's a lovely place to sit together and chat.",
  },
  {
    /* The tier names read like deadlines ("30-Day Routine") when they are
       really visit counts, so the answer corrects that before giving the
       actual validity period. */
    q: "How long do I have to use my package?",
    a: `The number in the name is how many visits you get, not a countdown — a 10-Day Reset is ten soaks, not ten days. You have ${packageValidityLabel} from the day you buy it to use them all, so you can come daily or spread them out to suit your week.`,
  },
  {
    q: `Can two of us share a ${doubleSoak.name}?`,
    a: `The ${doubleSoak.name} is two soaks for one person — either back to back, or one on each side of a coffee — so it can't be split between two people. Coming as a pair? Just book a soak each. You're very welcome to sit together, and we'll bring your coffees at the same time.`,
  },
  {
    q: "Can I bring my children?",
    a: "Little ones are welcome to come along, with a grown-up keeping an eye on them. If you'd like a child to have a soak, please check with our team first so we can make sure it's suitable and comfortable.",
  },
  {
    q: "Is the water cleaned between visits?",
    a: "Yes. Fresh water is prepared for every guest and the tubs are cleaned between visits.",
  },
  {
    q: "Can older adults enjoy it?",
    a: "Yes. Our space is gentle and comfortable. Let our team know if you'd like a hand getting settled.",
  },
  {
    q: "What if I have a medical condition?",
    a: "If you have a health condition, we suggest a quick word with your doctor beforehand. Our team is happy to help you feel comfortable.",
  },
  {
    q: "Is coffee included?",
    a: "Yes — a warm coffee or tea is part of your visit, to enjoy before or after your soak (not during, so everything stays clean and hygienic).",
  },
  {
    /* Only tea is confirmed as an alternative, so no other drink is named here.
       If the café settles a fuller drinks list, name it in this answer. */
    q: "I don't drink coffee — is there something else?",
    a: "Absolutely. Tea is included on exactly the same terms, so you never have to drink coffee to enjoy your visit. If you'd rather have something else, ask our team when you arrive or message us beforehand and we'll tell you what we have that day.",
  },
] as const;

/**
 * Per-soak rate after the first visit. One price, any time of day — the
 * off-peak Morning wellness / Midweek afternoon tiers were withdrawn, so
 * frequency (the routine ladder) is now the only thing that lowers the
 * per-visit price.
 */
export const sessionRates = [
  {
    name: "Standard single",
    slug: "single-soak",
    price: 40,
    detail: "Anytime · per soak, coffee included",
  },
] as const;

/** Packages & passes. `save` is vs the RM40 standard single, where it applies. */
export interface PackageOffer {
  id: string;
  /** Sellable catalogue entry this offer buys, so its CTA can preselect it. */
  slug: CatalogueSlug;
  name: string;
  price: number;
  detail: string;
  /** Saving vs paying the standard single rate, in MYR. Omitted when there isn't one. */
  save?: number;
  /** Per-session price for a multi-session pass, in MYR. Omitted for single items. */
  perSession?: number;
}

export const packages: readonly PackageOffer[] = [
  { id: "five-for-four", slug: "five-day-reset", name: "Buy 4, get 1 free", price: ladderPrices.fiveVisit, detail: "5 soaks for the price of 4.", save: 40 },
  doubleSoak,
];

/* --------------------------- derived helpers --------------------------- */

/** wa.me link with an optional pre-filled message. */
export function whatsappLink(message = "Hi Kaki Harmoni! I'd like to reserve a visit."): string {
  return whatsAppLink(businessConfig.whatsappNumber, message);
}

export const telLink = `tel:+${businessConfig.callNumber}`;

export const mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
  businessConfig.address.mapQuery,
)}&output=embed`;

export const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  businessConfig.address.mapQuery,
)}`;

export const mapsSearchLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  businessConfig.address.mapQuery,
)}`;

/* ======================================================================
 * CONVERSION LAYER — "Your 15-minute daily reset."
 *
 * The commercial proposition is the HABIT, not a discounted one-off soak.
 * Copy here stays experiential/wellness. No medical claims: nothing below
 * says or implies that a soak treats, cures or prevents any condition.
 * ====================================================================== */

/** The supporting proposition that sits under RELAX. REFRESH. RECONNECT. */
export const proposition = "Your 15-minute daily reset." as const;

/**
 * Stage-appropriate CTA wording. "Book Now" is deliberately NOT the only CTA —
 * the label should match where the customer is in the journey.
 */
export const ctaLabels = {
  /** New visitor — the dominant acquisition CTA across the site. */
  firstVisit: `Try Your First Soak — RM${businessConfig.pricing.prepay}`,
  /** Same promise, short enough for the nav bar. */
  firstVisitShort: `First Soak — RM${businessConfig.pricing.prepay}`,
  /**
   * Visitor weighing up frequency. Deliberately not "packages" — the section it
   * leads to argues these aren't really discounts but the easiest way to build a
   * habit, so the button promises the habit, not the transaction.
   */
  routine: "Build Your Routine",
  chooseRoutine: "Choose Your Routine",
  /** Returning customer. */
  nextReset: "Book Your Next Reset",
  /** Package customer. */
  makeRoutine: "Make It My Daily Routine",
} as const;

/**
 * LAUNCH OFFER — the RM25 prepay / RM30 at-the-door first visit is an introductory
 * price, NOT the standing rate. After the launch period a first visit is the usual
 * RM40, so anywhere the launch price is quoted must say it is time-limited.
 *
 * `endsLabel` is null because the business has not fixed an end date yet. Set it to
 * a human-readable date (e.g. "31 October 2026") and the precise wording switches on
 * everywhere automatically. Never invent a date here — an unfixed deadline is quoted
 * as "a limited period", which is true, rather than a made-up one, which is not.
 */
export const launchOffer: { active: boolean; endsLabel: string | null } = {
  /**
   * The one switch that retires the promotion. Flip to false and every
   * promotional line disappears without any page needing to be redesigned —
   * Your Visit in particular is built to still read correctly without it.
   */
  active: true,
  endsLabel: null,
};

/** Full sentence, for body copy and promotion terms. */
export const launchOfferNote = launchOffer.endsLabel
  ? `Launch offer — available until ${launchOffer.endsLabel}.`
  : "Launch offer — available for a limited period only.";

/**
 * Badge form. Deliberately NOT a watermark: a diagonal overlay reads as
 * DRAFT/VOID and would make the price look provisional. Once `endsLabel` is set
 * this sharpens from vague urgency to a real deadline, which converts better.
 */
export const launchOfferBadge = launchOffer.endsLabel
  ? `Until ${launchOffer.endsLabel}`
  : "Limited time only";

/** Compact form, for price tiles and cards where space is tight. */
export const launchOfferShort = launchOffer.endsLabel
  ? `Launch price until ${launchOffer.endsLabel}`
  : "Launch price — limited period";

/**
 * The routine ladder: TRY → RESET → ROUTINE → RITUAL.
 *
 * Framed by how often someone comes, not by how big the discount is.
 *
 * PRICING PROVENANCE — every price below is confirmed by the business. Do not
 * invent or adjust numbers here; the per-visit figures are DERIVED, not typed:
 *  - First Soak RM25 is the prepay first-visit launch price (RM30 at the door).
 *  - 5-Day Reset RM160 — the "Buy 4, get 1 free" package — is RM32 a visit.
 *  - 10-Day Reset RM300 is RM30 a visit.
 *  - 30-Day Routine RM840 is RM28 a visit.
 * The ladder gets cheaper per visit the more often you come, which is the whole
 * argument for the habit. `price: null` still renders "Price to be confirmed",
 * so any future unpriced tier degrades honestly rather than showing a guess.
 */
export interface RoutinePackage {
  id: string;
  /**
   * Sellable catalogue entry this rung buys. Every rung used to point at a bare
   * `/#reserve`, which dropped the customer into the RM25 first-visit basket
   * whichever tier they clicked; the slug is what carries their actual choice
   * through signup → slot → payment.
   */
  slug: CatalogueSlug;
  stage: "TRY" | "RESET" | "ROUTINE" | "RITUAL";
  name: string;
  visits: number;
  /** MYR. `null` means the business has not set this price yet. */
  price: number | null;
  /** Extra pricing nuance shown under the headline price. */
  priceNote?: string;
  /** Behaviour-led positioning line — why this tier, not what it costs. */
  positioning: string;
  cta: string;
  href: string;
  /** Highlighted as the natural next step after a first visit. */
  featured?: boolean;
  /** Carries the launch-offer badge — the price is time-limited, not standing. */
  limitedTime?: boolean;
}

export const routinePackages: readonly RoutinePackage[] = [
  {
    id: "first-soak",
    slug: "first-soak",
    stage: "TRY",
    name: "First Soak",
    visits: 1,
    price: businessConfig.pricing.prepay,
    priceNote: `or RM${businessConfig.pricing.walkin} at the door`,
    positioning: "For people who are new to Kaki Harmoni.",
    cta: "TRY IT",
    href: reserveHref("first-soak"),
    limitedTime: true,
  },
  {
    id: "five-day-reset",
    slug: "five-day-reset",
    stage: "RESET",
    name: "5-Day Reset",
    visits: 5,
    price: ladderPrices.fiveVisit,
    positioning: "Try making Kaki Harmoni part of your daily routine.",
    cta: "START MY RESET",
    href: reserveHref("five-day-reset"),
    featured: true,
  },
  {
    id: "ten-day-reset",
    slug: "ten-day-reset",
    stage: "ROUTINE",
    name: "10-Day Reset",
    visits: 10,
    price: ladderPrices.tenVisit,
    positioning: "Build the habit and make your daily reset part of your routine.",
    cta: "BUILD MY ROUTINE",
    href: reserveHref("ten-day-reset"),
  },
  {
    id: "thirty-day-routine",
    slug: "thirty-day-routine",
    stage: "RITUAL",
    name: "30-Day Routine",
    visits: 30,
    price: ladderPrices.thirtyVisit,
    positioning: "Make your 15-minute reset part of your everyday life.",
    cta: "MAKE IT MY ROUTINE",
    href: reserveHref("thirty-day-routine"),
  },
] as const;

/**
 * Headline name + price for a catalogue slug, for the "you're reserving …"
 * line the booking flow shows once a customer has picked a tier. Copy only —
 * what they are actually charged is priced from the `products` table server
 * side, never from anything the browser sends.
 */
export function offerForSlug(
  slug: CatalogueSlug,
): { name: string; price: number; visits: number } | null {
  const rung = routinePackages.find((p) => p.slug === slug);
  if (rung && rung.price !== null) {
    return { name: rung.name, price: rung.price, visits: rung.visits };
  }
  if (slug === "double-reset") {
    return { name: doubleSoak.name, price: doubleSoak.price, visits: 2 };
  }
  if (slug === "single-soak") {
    return { name: sessionRates[0].name, price: sessionRates[0].price, visits: 1 };
  }
  return null;
}

/** Per-visit price, or null while the package price is unconfirmed. */
export function perVisitPrice(pkg: RoutinePackage): number | null {
  if (pkg.price === null) return null;
  return Math.round((pkg.price / pkg.visits) * 100) / 100;
}

/** "Which package is right for me?" — makes the decision almost effortless. */
export const packagePicker = [
  { when: "Have never tried Kaki Harmoni", recommend: "First Soak", id: "first-soak" },
  { when: "Want to try a daily routine", recommend: "5-Day Reset", id: "five-day-reset" },
  { when: "Want to build a regular habit", recommend: "10-Day Reset", id: "ten-day-reset" },
  {
    when: "Want Kaki Harmoni as part of your everyday routine",
    recommend: "30-Day Routine",
    id: "thirty-day-routine",
  },
] as const;

/**
 * "Why not just do this at home?" — the complete experience, not health claims.
 * Every line below is about comfort, convenience and enjoyment.
 */
export const whyNotAtHome = [
  { title: "Fresh water, every time", text: "Prepared for you, then cleared away. Nothing to fill, nothing to empty." },
  { title: "Gentle bubbles and warmth", text: "A hydrosonic soak held at a comfortable temperature the whole 15 minutes." },
  { title: "Oils and mineral salts", text: "Chosen blends of essential oils and salts — not something you'd keep at home." },
  { title: "Four experiences to pick from", text: "Choose the mood that suits your day, and change it whenever you like." },
  { title: "A proper coffee", text: "Freshly made, waiting for you before or after your soak." },
  { title: "Company, if you want it", text: "Comfy chairs and someone to chat to — or a quiet corner if you'd rather not." },
  { title: "Nothing to clean up", text: "No buckets, no towels, no mopping the floor afterwards." },
  { title: "Fifteen minutes that are yours", text: "Away from the kitchen, the laundry and the to-do list." },
] as const;

/**
 * Genuine guest reviews ONLY. Kaki Harmoni opens for first visits on
 * 11 September 2026, so at the time of writing there are no real guests yet
 * and this list is intentionally empty — the section hides itself entirely
 * rather than render filler. Never add invented testimonials here.
 */
export interface Testimonial {
  quote: string;
  name: string;
  /** e.g. "Taman Gembira" — optional, only with the guest's permission. */
  detail?: string;
  /** Optional real photo in /public, used only with permission. */
  photo?: string;
}

export const testimonials: readonly Testimonial[] = [];

/**
 * Real footage of a visit, 15–30 seconds. Empty until the business has filmed
 * it — the section renders nothing rather than showing stock or a placeholder.
 * Set `src` to a file in /public (e.g. "/video/visit.mp4") to switch it on.
 */
export const experienceVideo: { src: string | null; poster?: string; caption?: string } = {
  src: null,
};
