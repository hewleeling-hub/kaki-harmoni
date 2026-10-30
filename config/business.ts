/**
 * Kaki Harmoni — customer-site content configuration (single source of truth).
 *
 * All values here are the REAL business facts, drawn from the existing app
 * (lib/whatsapp.ts, lib/config.ts, site-footer, location page). The site is
 * Customers share their details, pick a slot, then pay — payment is what
 * open after launch. Do not invent prices or availability.
 */

import { firstVisitPaused, activeVoucherOffer, ELEVEN_ELEVEN } from "@/config/promotions";
import {
  BUSINESS_WHATSAPP_NUMBER,
  BUSINESS_WHATSAPP_DISPLAY,
  BUSINESS_CALL_NUMBER,
  BUSINESS_CALL_DISPLAY,
  whatsAppLink,
} from "@/lib/whatsapp";
import {
  FIRST_VISIT_PRICE_MYR,
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
  whatsappDisplay: BUSINESS_WHATSAPP_DISPLAY, // 019-287 1799
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

  /**
   * THE opening hours. Everything derives from here — the copy on every page,
   * the JSON-LD Google reads, and the booking slots themselves (lib/slots.ts
   * imports closeHour rather than keeping its own copy, which it used to).
   *
   * Hours differ at the weekend, so the close hour is a pair rather than one
   * number and lib/slots.ts picks the right one per date. Both are exclusive
   * and slots run every 30 minutes — change a number and the `display` /
   * `lastSoak` sentences with it, since nothing forces those to agree.
   */
  hours: {
    label: "Open daily",
    display: "Mon–Fri 10:00am – 6:00pm · Sat–Sun 10:00am – 4:00pm",
    lastSoak:
      "First soak begins at 10:30am. Last soak begins at 5:30pm on weekdays, 3:30pm at weekends.",
    openHour: 10,
    /**
     * Minutes past openHour before the FIRST soak can start.
     *
     * The shop opens at 10:00; the first bookable soak is 10:30, which is the
     * setting-up half hour. Separate from openHour on purpose — the door time
     * is what the JSON-LD and the "open daily" copy should say, and a guest
     * arriving at 10:05 is not arriving early. Collapsing the two would move
     * the advertised opening time to suit the booking grid.
     */
    firstSlotMinute: 30,
    /** Exclusive, and slots run every 30 minutes: 18 makes 17:30 the last one. */
    closeHourWeekday: 18,
    /** Exclusive: 16 makes 15:30 the last weekend slot. */
    closeHourWeekend: 16,
    timezone: "Asia/Kuala_Lumpur",
    /**
     * Whole days the shop is shut, as ISO dates (Kuala Lumpur). The calendar
     * offers no slots on these and /api/purchases and /api/bookings refuse them,
     * so a typed or shared link cannot book one either. Add a date here and
     * nothing else needs to change; remove it once it has passed.
     */
    closedDates: ["2026-11-01"] as readonly string[],
  },

  /**
   * First-visit pricing (MYR). `firstVisit` is ONE price however you pay —
   * online or at the door — which is why there is no prepay/walkin pair here
   * any more. `normal` is what a soak costs once you are no longer new.
   */
  pricing: {
    firstVisit: FIRST_VISIT_PRICE_MYR, // 30
    normal: 40, // standard single soak, and the first-visit price without the offer
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
    long: "Choose a time slot from the calendar that suits you.",
  },
  {
    number: 3,
    title: "Pay to confirm it",
    icon: "gift",
    short: "Your slot is confirmed once you pay.",
    long: `RM${businessConfig.pricing.firstVisit} for your first visit — pay online now or at the door when you arrive, whichever suits you.`,
  },
  {
    number: 4,
    title: "Relax and reconnect",
    icon: "heart",
    short: "Enjoy a warm 15-minute soak and a friendly chat.",
    long: "Come in for a warm 15-minute leg soak, a comfortable seat and a friendly chat. Coffee and other drinks are available to buy from the café.",
  },
] as const;

/**
 * "How did you hear about us?" — asked on the CONFIRMATION page, not in the
 * signup form. It is a question that serves the shop rather than the customer,
 * and it sat between them and the button; after the details are saved there is
 * nothing left to lose by asking, and answer rates go up rather than down when
 * nothing is at stake.
 *
 * Shared by the prompt and the endpoint that stores the answer, so the two
 * can't disagree about what a valid value is.
 */
export const referralOptions = [
  "Instagram",
  "Facebook",
  "TikTok",
  "Friend",
  "Walk-in",
  "Other",
] as const;

/**
 * A coffee comes with every soak, at every price on the ladder.
 *
 * It was in the prose — the hero, the FAQ, the first-visit cards — but never
 * on the surfaces where someone is deciding what a price actually buys: the
 * ladder cards, the package descriptions in checkout, the experiences. A
 * guest fed back that they couldn't tell whether coffee was included, which
 * is a real cost: it is a third of the reason to come rather than fill a
 * basin at home, and it was being left out of the pitch at the moment of the
 * decision.
 *
 * KEPT AS AN EMPTY CONCEPT ON PURPOSE — see git history. Coffee is NOT
 * included with a soak at any price; it is sold separately at the café. The
 * note that used to say otherwise appeared on every rung of the ladder, which
 * made it the single most-repeated untrue line on the site once that changed.
 * Removed rather than reworded: a price that includes nothing extra needs no
 * line explaining what it includes.
 */

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
    a: "Booking is open — share your details, pick a time slot, then pay to confirm it.",
  },
  {
    q: "How long is each session?",
    a: "Each warm leg soak lasts about 15 minutes — a simple break that fits into your day. Fancy a longer unwind? You're very welcome to go back to back — tell our team when you arrive.",
  },
  {
    q: "How often should I come?",
    a: "As often as you like — though Kaki Harmoni is really designed around regular visits. It's only fifteen minutes, so many guests find it works best as a small daily habit: a quiet moment before work, or a reset on the way home. Come once first and see how it fits your day.",
  },
  {
    /* Placed straight after the "how often" answer on purpose: someone reading
       about a daily habit is exactly the person who might want a spa at home,
       and Margret's ten years on the About page has already done the
       persuading. Deliberately quotes NO price, model or availability — none
       of that is confirmed here, and an unkeepable number is worse than an
       invitation to ask. Same rule as the drinks answer. */
    q: "Can I get one of these for home?",
    a: "Yes, ask us about it. A home spa is how Kaki Harmoni started — one of us has had one for over ten years. Have a word with our team when you visit, or message us, and we'll talk you through what's involved.",
  },
  {
    q: "Do I need to live at Desa Cindaimas?",
    a: "Not at all. Kaki Harmoni is inside the Desa Cindaimas clubhouse, but it's open to everyone — you don't need to be a resident. Visitors and walk-ins are always welcome, and there's free parking on site.",
  },
  {
    q: "How much is a visit?",
    a: `Your first visit is RM${businessConfig.pricing.firstVisit} — the same price whether you pay online or at the door. That's an opening-period price; after it a first visit is the usual RM${businessConfig.pricing.normal}. A single soak is RM${businessConfig.pricing.normal} after that, or less with a package: from RM${ladderPerVisit.entry} a visit on the 5-Day Reset down to RM${ladderPerVisit.cheapest} on the 30-Day Routine.`,
  },
  {
    q: "Do I pick a time when I book?",
    a: "Yes — you choose your slot from the calendar first, and it's confirmed once your payment goes through.",
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
    /* The doctor stays FIRST and the WhatsApp offer is deliberately narrow:
       we describe what a soak involves, we don't say whether it's suitable.
       "Message us to check" on its own reads as an offer to clear someone
       medically — which is not something a foot spa can do, and is the same
       line the rest of the site is careful not to cross. Giving them the
       details to take to their doctor is genuinely useful and claims
       nothing. */
    q: "What if I have a medical condition?",
    a: `If you have a health condition, we suggest a quick word with your doctor beforehand. Message us on WhatsApp or call us on ${businessConfig.callDisplay} if it helps, and we'll talk you through exactly what a soak involves, so you have the details to check with them. Our team is happy to help you feel comfortable on the day.`,
  },
  {
    q: "Is coffee included?",
    a: "No — the price covers your soak. Our café is right there, so you're very welcome to buy a coffee or another drink to enjoy before or after (not during, so everything stays clean and hygienic).",
  },
  {
    /* DRINKS: coffee is the one drink guaranteed with a visit, and the only one
       named anywhere on this site. Other drinks are stocked but the selection
       varies day to day, so the answer promises that something else exists
       without naming it — the previous copy offered tea "on exactly the same
       terms", which isn't carried at all, and a guest who chose us for that
       would have found out at the counter. Name a specific drink here only if
       it is always in stock. */
    q: "I don't drink coffee — is there something else?",
    a: "Yes — we keep other drinks besides coffee. What's on changes from day to day, so just ask our team when you arrive and they'll tell you what we have. Nobody has to buy anything: the soak is the point.",
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
    detail: "Anytime · per soak",
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

/*
 * The Double Reset was removed entirely — definition, catalogue slug and
 * product row — after it was confirmed never to have sold. `packages` is the
 * list of passes beside the routine ladder; it currently holds one.
 */
export const packages: readonly PackageOffer[] = [
  { id: "five-for-four", slug: "five-day-reset", name: "Buy 4, get 1 free", price: ladderPrices.fiveVisit, detail: "5 soaks for the price of 4.", save: 40 },
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
  firstVisit: `Try Your First Soak — RM${businessConfig.pricing.firstVisit}`,
  /** Neutral ask, for when the first-visit price is paused by a running offer. */
  reserve: "Reserve a soak",
  /** Same promise, short enough for the nav bar. */
  firstVisitShort: `First Soak — RM${businessConfig.pricing.firstVisit}`,
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
 * LAUNCH OFFER — the RM30 first visit is an introductory price, NOT the standing
 * rate, and it is the same whether the guest pays online or at the door. After
 * the launch period a first visit is the usual RM40, so anywhere the price is
 * quoted must say it is time-limited.
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
 *  - First Soak RM30 is the first-visit price, the same online or at the door.
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
    price: businessConfig.pricing.firstVisit,
    priceNote: "online or at the door — same price",
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
  if (slug === "single-soak") {
    return { name: sessionRates[0].name, price: sessionRates[0].price, visits: 1 };
  }
  /* The voucher is sold through this flow like anything else, so the signup
     form has to be able to name it back to the customer. Priced from the offer
     rather than the package ladder, which it is not part of. */
  const voucher = activeVoucherOffer();
  if (voucher && slug === voucher.slug) {
    return { name: voucher.title, price: Number(voucher.price.replace(/[^0-9.]/g, "")), visits: 1 };
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
  { title: "A proper coffee on hand", text: "A café right beside you — buy one before or after your soak, with nothing to wash up." },
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

/**
 * Whether the site addresses returning guests as a separate audience — the
 * first-time/returning toggle on Your Visit, and the "Already a Kaki Harmoni
 * regular?" card beside it.
 *
 * FALSE for launch. Everyone arriving on 11 September is a first-time visitor,
 * so asking made the site look like it had a history it doesn't have, and put
 * a "Welcome back" invitation in front of people who have never been.
 *
 * A flag rather than a deletion, and one flag rather than two: returning
 * guests are the entire point of the routine ladder, and the booking system
 * already handles them properly — the RM25 first-visit price is enforced once
 * per person server-side whatever this says. Flip it to true once there are
 * regulars and every returning-visitor surface comes back together, rather
 * than one of them being found months later still switched off.
 */
export const SHOW_RETURNING_VISITOR = false;

export const testimonials: readonly Testimonial[] = [];

/*
 * There was a `founders` array here, waiting on three portrait photographs so
 * About could render a row of circles. One group photo of the three of them
 * arrived instead, which says more than three crops would, so About now hardcodes
 * that single image (/founders/the-three-of-us.png) and the config-driven
 * version is gone rather than left sitting unused.
 */

/**
 * Real footage of a visit, 15–30 seconds. Empty until the business has filmed
 * it — the section renders nothing rather than showing stock or a placeholder.
 * Set `src` to a file in /public (e.g. "/video/visit.mp4") to switch it on.
 */
export const experienceVideo: { src: string | null; poster?: string; caption?: string } = {
  src: null,
};


/**
 * The FAQ as it should read RIGHT NOW.
 *
 * `faqs` above is a module-level constant, evaluated once when the module is
 * first imported. In production that happens at server start, so a date check
 * written into it would freeze at whatever was true then and never flip when
 * the offer closes. This is a function for that reason — call it per request.
 *
 * Only the price answer changes: while the 11.11 voucher is on sale the RM30
 * first visit is not promoted (see firstVisitPaused), so the answer leads with
 * the standing rates and the voucher instead of an introductory price the site
 * is no longer offering anywhere else.
 */
export function faqsNow(now: Date = new Date()): readonly { q: string; a: string }[] {
  const base = firstVisitPaused(now)
    ? faqs.map((item) =>
        item.q === "How much is a visit?"
          ? {
              q: item.q,
              a: `While the 11.11 offer runs, a Foot Spa Voucher is RM11 a soak — buy by 11 November, two per person, redeem by 31 December. After that a single soak is RM${businessConfig.pricing.normal}. Packages work out cheaper again if you come often — ask our team in the shop and they'll set one up for you.`,
            }
          : item,
      )
    : faqs;

  /* The voucher's own entry outlives the sale: it is bought by 11 November but
     can be used until 31 December, and the question "when does it run out?" is
     asked most in the weeks AFTER the band has gone. So the window here is
     sellFrom to the end of the redeem-by day (KL), not the sale window that
     firstVisitPaused() uses. */
  const offer = ELEVEN_ELEVEN;
  const redeemEnd = new Date(new Date(`${offer.redeemByISO}T00:00:00+08:00`).getTime() + 24 * 60 * 60 * 1000);
  if (now < offer.sellFrom || now >= redeemEnd) return base;

  const entry = {
    q: "How does the 11.11 voucher work?",
    a: `The 11.11 Foot Spa Voucher is RM11 a soak. Buy by ${offer.sellUntilLabel}, up to ${offer.maxPerPerson} per person. It must be redeemed by ${offer.redeemByLabel} — after that it can no longer be used. Pick your time when you book, or pay now and choose your time later, as long as you use it by ${offer.redeemByLabel}.`,
  };
  /* Straight under "How long do I have to use my package?": that is where
     someone looking for a deadline is already reading. */
  const at = base.findIndex((item) => item.q === "How long do I have to use my package?");
  return at === -1 ? [...base, entry] : [...base.slice(0, at + 1), entry, ...base.slice(at + 1)];
}


/**
 * The routine ladder as it should read RIGHT NOW.
 *
 * While the 11.11 voucher is on sale the TRY rung is the voucher, not the
 * RM30 first visit: the ladder's whole job is to show the cheapest way in and
 * then the ways to come back, and leaving RM30 on the bottom rung while an
 * RM11 band runs above it puts the dearer option in the place reserved for
 * the cheaper one.
 *
 * A function, not a constant, for the same reason as faqsNow(): a module-level
 * date check is evaluated once at server start and would never flip.
 */
export function routinePackagesNow(now: Date = new Date()): readonly RoutinePackage[] {
  if (!firstVisitPaused(now)) return routinePackages;
  return routinePackages.map((rung) =>
    rung.id === "first-soak"
      ? {
          ...rung,
          name: "11.11 Voucher",
          price: 11,
          priceNote: "buy by 11 Nov · 2 per person · redeem by 31 Dec",
          positioning: "The cheapest way to try us while the offer runs.",
          cta: "GET A VOUCHER",
          href: "/#voucher-form",
          limitedTime: true,
        }
      : rung,
  );
}
