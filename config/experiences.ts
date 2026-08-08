/**
 * Signature experiences — four warm "moods" of the same real 15-minute soak,
 * matching the printed Signature Experience poster (name, MOYA blend, icon).
 * Includes the detail content shown in the "Learn More" modal.
 * Editable content; no medical claims.
 */

export type ExperienceIconName = "moon" | "blossom" | "leaf" | "legs";

export interface Experience {
  id: string;
  name: string;
  ingredients: string; // MOYA blend, from the poster
  tagline: string;
  description: string;
  duration: string;
  icon: ExperienceIconName;
  iconBg: string; // solid colour of the icon circle (from the poster)
  glowRgb: string; // "r,g,b" for the soft glow + pale tints
  image?: string; // real circular icon artwork (overrides the drawn SVG)
  productImage?: string; // optional real product photo for the detail hero

  // ── Detail-view content ("Learn More" modal) ──
  accent: string; // deep accent hex (badges/headline/text emphasis)
  primaryOil: string; // hero oil name shown on the bottle
  headline: string; // short emotional line
  longDescription: string;
  perfectFor: readonly string[];
  feels: readonly string[]; // "what it feels like" pills
  lottiQuote: string;
  benefits?: readonly { readonly title: string; readonly text: string }[]; // from the product poster
  naturalNote?: string;
}

export const experiences: Experience[] = [
  {
    id: "deep-calm",
    name: "Deep Calm",
    ingredients: "Lavender + Camomile + Melissa",
    tagline: "Perfect after long work days.",
    description:
      "A soothing soak for days when you simply need to switch off and slow right down.",
    duration: "15 mins",
    icon: "moon",
    iconBg: "#6b4f9e",
    glowRgb: "107,79,158",
    image: "/experiences/deep-calm.png",
    productImage: "/experiences/deep-calm-oil.png",
    accent: "#5b3a8e",
    primaryOil: "Lavender",
    headline: "Unwind your mind, soothe your body and sleep better.",
    longDescription:
      "A calming aromatic soak created for days when everything feels a little too busy. Settle in, enjoy the warm water and let yourself slow down for 15 minutes.",
    perfectFor: ["After a long day", "Quiet me-time", "Evening wind-down"],
    feels: ["Soft", "Floral", "Comforting", "Calm"],
    lottiQuote: "This is my pick when my brain refuses to clock out!",
    benefits: [
      { title: "Relaxes & soothes", text: "Calms the mind and body." },
      { title: "Promotes restful sleep", text: "Helps you unwind naturally." },
      { title: "Nourishes & hydrates", text: "Leaves skin soft, smooth and refreshed." },
      { title: "Perfect anytime", text: "Ideal for a soothing evening routine." },
    ],
    naturalNote: "100% natural essential oils & herbal spa salt.",
  },
  {
    id: "gentle-comfort",
    name: "Gentle Comfort",
    ingredients: "Camomile + Pine + Lemon",
    tagline: "Especially for seniors and those who need a little extra care.",
    description:
      "A gentler soak centred around warmth, comfort and easy, unhurried relaxation.",
    duration: "15 mins",
    icon: "blossom",
    iconBg: "#c8952f",
    glowRgb: "200,149,47",
    image: "/experiences/gentle-comfort.png",
    accent: "#c06a10",
    primaryOil: "Camomile",
    headline: "Gentle warmth. Extra care.",
    longDescription:
      "A comforting soak designed especially for seniors and those who need a little extra care. Warm, soothing and easy on the body.",
    perfectFor: ["Seniors", "Sensitive feet", "Those who need extra care"],
    feels: ["Warm", "Comforting", "Nurturing", "Easy"],
    lottiQuote: "A warm hug for your feet and your heart.",
  },
  {
    id: "fresh-start",
    name: "Fresh Start",
    ingredients: "Eucalyptus + Camomile + Melissa",
    tagline: "A clean, uplifting reset.",
    description:
      "A refreshing soak for when you want to feel clear, light and ready to go again.",
    duration: "15 mins",
    icon: "leaf",
    iconBg: "#2f7d46",
    glowRgb: "47,125,70",
    image: "/experiences/fresh-start.png",
    accent: "#477a3c",
    primaryOil: "Eucalyptus",
    headline: "A clean, uplifting reset.",
    longDescription:
      "A refreshing aromatic soak to help you feel clear, light and ready to take on whatever comes next.",
    perfectFor: ["New beginnings", "Midweek refresh", "Days when you need a reset"],
    feels: ["Fresh", "Clean", "Bright", "Uplifting"],
    lottiQuote: "Like a deep breath for your whole body!",
  },
  {
    id: "light-legs",
    name: "Light Legs",
    ingredients: "Juniper + Camomile + Seaweed",
    tagline: "For active lifestyles and tired feet.",
    description:
      "A refreshing soak for days when your legs have been doing a little too much.",
    duration: "15 mins",
    icon: "legs",
    iconBg: "#1c8a8d",
    glowRgb: "28,138,141",
    image: "/experiences/light-legs.png",
    accent: "#087c91",
    primaryOil: "Juniper",
    headline: "Feel lighter. Move easier.",
    longDescription:
      "A refreshing soak for days when your legs have been doing a little too much. Cool, soothing and perfect for tired, heavy legs.",
    perfectFor: ["Active lifestyles", "Long days on your feet", "Tired, heavy legs"],
    feels: ["Refreshing", "Cooling", "Light", "Reviving"],
    lottiQuote: "My go-to after a busy day on my little feet!",
  },
];
