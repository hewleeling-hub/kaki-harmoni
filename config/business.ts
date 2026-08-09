/**
 * Kaki Harmoni — customer-site content configuration (single source of truth).
 *
 * All values here are the REAL business facts, drawn from the existing app
 * (lib/whatsapp.ts, lib/config.ts, site-footer, location page). The site is
 * PRE-LAUNCH: customers reserve + prepay to lock the launch price; time slots
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
    short: "Pop in your details to hold your launch-price visit.",
    long: "Share your name and number to hold your first visit at the launch price.",
  },
  {
    number: 2,
    title: "Prepay to lock the price",
    icon: "gift",
    short: "Pay online to lock the launch rate.",
    long: `Prepay RM${businessConfig.pricing.prepay} for your first visit to lock the launch rate — or choose to pay RM${businessConfig.pricing.walkin} at the door.`,
  },
  {
    number: 3,
    title: "Pick your time",
    icon: "calendar",
    short: "Choose a slot that suits you.",
    long: `Choose a time slot from the calendar — first visits are from ${businessConfig.bookingStartLabel}.`,
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
export const faqs = [
  {
    q: "When can I visit?",
    a: `Booking is open now — first visits are from ${businessConfig.bookingStartLabel}. Reserve, prepay to lock the launch price, then pick a time slot.`,
  },
  {
    q: "How long is each session?",
    a: "Each warm leg soak lasts about 15 minutes — a simple break that fits into your day. Fancy a longer unwind? Many guests enjoy a second soak straight after, or after a coffee break.",
  },
  {
    q: "How much is a visit?",
    a: `Your first visit is RM${businessConfig.pricing.prepay} when you prepay online (or RM${businessConfig.pricing.walkin} at the door), instead of the usual RM${businessConfig.pricing.normal}.`,
  },
  {
    q: "Do I pick a time when I book?",
    a: `Yes — after you prepay, you'll choose a time slot from the calendar. The first available date is ${businessConfig.bookingStartLabel}.`,
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
] as const;

/** Per-soak rates (after the first visit). Standard + friendly off-peak. */
export const sessionRates = [
  { name: "Standard single", price: 40, detail: "Anytime · per soak" },
  { name: "Morning wellness", price: 28, detail: "Weekdays, 10am–12pm · per soak" },
  { name: "Midweek afternoon", price: 32, detail: "Tue–Thu, 2–4pm · per soak" },
] as const;

/** Packages & passes. `save` is vs the RM40 standard single. */
export const packages = [
  { name: "Buy 4, get 1 free", price: 160, detail: "5 soaks for the price of 4.", save: 40 },
  { name: "Double + bun & coffee", price: 68, detail: "Two soaks, plus a bun & coffee to share." },
  { name: "Resident pass", price: 240, detail: "8 soaks · proof of residence.", save: 80 },
] as const;

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
