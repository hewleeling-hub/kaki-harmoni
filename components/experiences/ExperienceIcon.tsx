import type { Experience } from "@/config/experiences";

/** 4-point sparkle star path centred at (cx,cy). */
function star(cx: number, cy: number, r: number) {
  const i = r * 0.34;
  return `M${cx} ${cy - r}L${cx + i} ${cy - i}L${cx + r} ${cy}L${cx + i} ${cy + i}L${cx} ${cy + r}L${cx - i} ${cy + i}L${cx - r} ${cy}L${cx - i} ${cy - i}Z`;
}

/**
 * Signature-experience glyphs, recreated as SVG to match the printed poster:
 * crescent moon + sparkles, 8-petal blossom, leaf with midrib, two legs.
 * Rendered white on a coloured circle. Decorative — the name carries meaning.
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
        {/* bold right-facing crescent */}
        <path d="M20.6 14.6A8.6 8.6 0 1 1 9.5 3.4 6.9 6.9 0 0 0 20.6 14.6Z" />
        <path d={star(6.2, 3.6, 2)} />
        <path d={star(19.1, 5.4, 1.4)} />
        <path d={star(18.4, 13.9, 1.6)} />
      </svg>
    );
  }

  if (name === "blossom") {
    const petals: Array<[number, number]> = [
      [17.9, 12], [16.2, 16.2], [12, 17.9], [7.8, 16.2],
      [6.1, 12], [7.8, 7.8], [12, 6.1], [16.2, 7.8],
    ];
    return (
      <svg {...box} fill="currentColor">
        {petals.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.15} />
        ))}
        <circle cx={12} cy={12} r={2.5} />
      </svg>
    );
  }

  if (name === "leaf") {
    return (
      <svg {...box} fill="currentColor">
        <g transform="rotate(20 12 12)">
          <path d="M12 3C8.3 6.7 8.3 15.3 12 21 15.7 15.3 15.7 6.7 12 3Z" />
          <path d="M12 5.4V19" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  // legs — two calves with feet
  return (
    <svg {...box} fill="currentColor">
      <rect x="7.1" y="3" width="3" height="12.7" rx="1.5" />
      <rect x="13.9" y="3" width="3" height="12.7" rx="1.5" />
      <rect x="5.4" y="15.5" width="5.1" height="2.7" rx="1.35" />
      <rect x="13.5" y="15.5" width="5.1" height="2.7" rx="1.35" />
    </svg>
  );
}
