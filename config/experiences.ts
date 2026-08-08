/**
 * Signature experiences — four warm "moods" of the same real 15-minute soak,
 * matching the printed Signature Experience poster (name, MOYA blend, icon).
 * Editable content; rendered on /experiences. No medical claims.
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
  glowRgb: string; // "r,g,b" for the soft background glow behind the icon
  image?: string; // optional real icon artwork (overrides the drawn SVG)
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
  },
];
