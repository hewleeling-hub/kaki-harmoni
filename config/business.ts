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
  launchWindow: LAUNCH_WINDOW, // "early August"
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
    long: `Prepay RM${businessConfig.pricing.prepay} online to lock the launch rate — or choose to pay RM${businessConfig.pricing.walkin} at the door.`,
  },
  {
    number: 3,
    title: "We'll message you",
    icon: "message",
    short: "We'll WhatsApp you to pick a time once we open.",
    long: `Once we open in ${businessConfig.launchWindow}, we'll WhatsApp you to choose a time that suits you.`,
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
  "Wear comfortable clothing.",
  "Each soak lasts about 15 minutes.",
  "Please arrive five minutes early.",
  "Let our team know if you need any assistance.",
  "Children should be supervised.",
  "Some health conditions may need a word with your doctor before soaking.",
] as const;

/** FAQ content — editable here, rendered by the accordion. */
export const faqs = [
  {
    q: "When are you opening?",
    a: `We're opening in ${businessConfig.launchWindow}. Reserve now to lock the launch price, and we'll message you to schedule your first visit.`,
  },
  {
    q: "How long is each session?",
    a: "Each warm leg soak lasts about 15 minutes — a simple break that fits into your day.",
  },
  {
    q: "How much is a visit?",
    a: `Your first visit is RM${businessConfig.pricing.prepay} when you prepay online (or RM${businessConfig.pricing.walkin} at the door), instead of the usual RM${businessConfig.pricing.normal}.`,
  },
  {
    q: "Do I need to pick a time now?",
    a: "Not yet. While we're getting ready to open, you just reserve and prepay. We'll WhatsApp you to choose a time once we're open.",
  },
  {
    q: "What should I wear?",
    a: "Comfortable, everyday clothing is perfect. You'll simply roll up for the soak.",
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
    a: "Yes — a warm drink is part of your relaxing visit.",
  },
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
