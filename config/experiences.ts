/**
 * Signature experiences — four warm "moods" of the same real 15-minute soak.
 * Editable content; rendered on /experiences. No medical claims.
 */

export type ExperienceGlow = "sage" | "coral" | "teal" | "sand";

export interface Experience {
  id: string;
  name: string;
  tagline: string;
  description: string;
  duration: string;
  glow: ExperienceGlow;
}

export const experiences: Experience[] = [
  {
    id: "deep-calm",
    name: "Deep Calm",
    tagline: "Perfect after long work days.",
    description:
      "A soothing soak for days when you simply need to switch off and slow right down.",
    duration: "15 mins",
    glow: "sage",
  },
  {
    id: "gentle-comfort",
    name: "Gentle Comfort",
    tagline: "Especially for seniors and those who need a little extra care.",
    description:
      "A gentler soak centred around warmth, comfort and easy, unhurried relaxation.",
    duration: "15 mins",
    glow: "coral",
  },
  {
    id: "light-legs",
    name: "Light Legs",
    tagline: "For active lifestyles and tired feet.",
    description:
      "A refreshing soak for days when your legs have been doing a little too much.",
    duration: "15 mins",
    glow: "teal",
  },
  {
    id: "warm-restore",
    name: "Warm Restore",
    tagline: "Perfect for rainy days and cool weather.",
    description:
      "Warm, comforting and wonderfully cosy when your body is asking you to slow down.",
    duration: "15 mins",
    glow: "sand",
  },
];
