import type { Experience } from "@/config/experiences";

/**
 * Signature-experience glyphs, recreated as SVG to match the poster's
 * icon set (moon / blossom / leaf / legs). Rendered white on a coloured
 * circle. Decorative — the experience name carries the meaning.
 */
export function ExperienceIcon({
  name,
  size = 44,
}: {
  name: Experience["icon"];
  size?: number;
}) {
  const box = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true as const };

  if (name === "moon") {
    return (
      <svg {...box} fill="currentColor">
        <path d="M20.6 14.9A8 8 0 0 1 9.1 3.4 8 8 0 1 0 20.6 14.9Z" />
        <path d="M6.3 2.6l.62 1.68L8.6 4.9l-1.68.62L6.3 7.2l-.62-1.68L4 4.9l1.68-.62L6.3 2.6Z" />
        <path d="M17.8 5.1l.45 1.25 1.25.45-1.25.45-.45 1.25-.45-1.25-1.25-.45 1.25-.45.45-1.25Z" />
      </svg>
    );
  }

  if (name === "blossom") {
    return (
      <svg {...box} fill="currentColor">
        <circle cx="12" cy="12" r="2.5" />
        <circle cx="12" cy="5.6" r="2.3" />
        <circle cx="17.5" cy="8.8" r="2.3" />
        <circle cx="17.5" cy="15.2" r="2.3" />
        <circle cx="12" cy="18.4" r="2.3" />
        <circle cx="6.5" cy="15.2" r="2.3" />
        <circle cx="6.5" cy="8.8" r="2.3" />
      </svg>
    );
  }

  if (name === "leaf") {
    return (
      <svg {...box} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.8 19.2c0-8 6-13.8 14.6-13.8 0 8-6 13.8-14.6 13.8Z" fill="currentColor" stroke="none" />
        <path d="M6 18C9.5 14.5 13 11 16.5 8.5" stroke="#ffffff" strokeWidth={1.4} opacity="0.55" />
      </svg>
    );
  }

  // legs
  return (
    <svg {...box} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3l.7 8.4a6 6 0 0 1-.4 2.6L8 18.5" />
      <path d="M15 3l-.7 8.4a6 6 0 0 0 .4 2.6l1.3 4.5" />
      <path d="M6.6 20.4h3.2M14.2 20.4h3.2" />
    </svg>
  );
}
