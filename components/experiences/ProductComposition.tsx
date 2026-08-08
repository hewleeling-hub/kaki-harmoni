import Image from "next/image";
import type { Experience } from "@/config/experiences";

/**
 * Left visual for the experience detail modal. Oils + bath salts are the hero.
 * If exp.productImage is set (a real product photo), it fills the panel and is
 * the hero — the icon is overlaid top-left; Lotti stays in the "Lotti says"
 * box, not on the busy photo. Otherwise a stylised SVG bottle + salt jar (with
 * a small supporting Lotti) is drawn, tinted to the experience colour.
 */
export function ProductComposition({ exp }: { exp: Experience }) {
  const glow = `rgba(${exp.glowRgb},0.30)`;

  if (exp.productImage) {
    return (
      <div
        className="relative min-h-[240px] overflow-hidden rounded-[20px] sm:min-h-[300px] lg:min-h-full"
        style={{ background: `radial-gradient(circle at 50% 42%, ${glow}, transparent 72%)` }}
      >
        <Image
          src={exp.productImage}
          alt={`${exp.name} — ${exp.primaryOil} bath oil and matching bath salts`}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-contain p-3 sm:p-4"
          priority
        />
        {exp.image && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-ivory/85 p-1 shadow-[var(--shadow-warm)] backdrop-blur-sm">
            <Image src={exp.image} alt="" width={60} height={60} className="h-[54px] w-[54px] object-contain" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-[20px] p-5 lg:min-h-full"
      style={{ background: `radial-gradient(circle at 50% 42%, ${glow}, transparent 72%)` }}
    >
      {exp.image && (
        <div
          className="absolute left-4 top-4 rounded-full"
          style={{ boxShadow: `0 0 0 6px rgba(${exp.glowRgb},0.14)` }}
        >
          <Image src={exp.image} alt={`${exp.name} icon`} width={72} height={72} className="h-[68px] w-[68px] object-contain" />
        </div>
      )}

      <Composition exp={exp} />

      {/* small supporting Lotti */}
      <Image
        src="/lotti.png"
        alt="Lotti"
        width={110}
        height={110}
        className="absolute bottom-2 right-2 z-20 h-auto w-[26%] max-w-[110px] object-contain drop-shadow-[0_6px_14px_rgba(83,66,46,0.18)]"
      />
    </div>
  );
}

function Composition({ exp }: { exp: Experience }) {
  const a = exp.accent;
  return (
    <svg viewBox="0 0 320 300" className="relative z-10 h-auto w-full max-w-[380px]" role="img" aria-label={`${exp.primaryOil} bath oil and matching bath salts`}>
      {/* botanical sprig behind */}
      <g stroke={a} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55">
        <path d="M232 132c14-20 20-46 16-70" />
        <path d="M244 96c14-2 24-10 28-22" />
        <path d="M240 116c14 0 25-6 31-17" />
        <path d="M236 74c-11-4-18-13-19-25" />
      </g>
      <g fill={a} opacity="0.5">
        <ellipse cx="276" cy="70" rx="8" ry="4" transform="rotate(-32 276 70)" />
        <ellipse cx="272" cy="94" rx="8" ry="4" transform="rotate(-20 272 94)" />
        <ellipse cx="214" cy="47" rx="8" ry="4" transform="rotate(28 214 47)" />
      </g>

      {/* salt jar (front-left, second largest) */}
      <g>
        <rect x="40" y="168" width="96" height="96" rx="16" fill="#fffdf8" stroke="rgba(120,95,70,0.18)" />
        <rect x="40" y="182" width="96" height="34" fill={`rgba(${exp.glowRgb},0.18)`} />
        <rect x="34" y="150" width="108" height="26" rx="10" fill={a} />
        <rect x="58" y="206" width="60" height="34" rx="8" fill="#fff" stroke="rgba(120,95,70,0.14)" />
        <text x="88" y="223" textAnchor="middle" fontSize="11" fontWeight="700" fill={a} fontFamily="Inter, sans-serif">BATH</text>
        <text x="88" y="235" textAnchor="middle" fontSize="10" fontWeight="600" fill={a} fontFamily="Inter, sans-serif" opacity="0.9">SALT</text>
      </g>
      {/* salt grains */}
      <g fill={a} opacity="0.55">
        <circle cx="150" cy="262" r="3.4" />
        <circle cx="160" cy="256" r="2.6" />
        <circle cx="168" cy="264" r="3" />
        <circle cx="30" cy="260" r="2.8" />
      </g>

      {/* oil bottle (hero, tallest) */}
      <g>
        <rect x="150" y="86" width="78" height="176" rx="18" fill={a} opacity="0.9" />
        <rect x="158" y="96" width="20" height="150" rx="10" fill="#ffffff" opacity="0.14" />
        <rect x="176" y="60" width="26" height="30" fill={a} opacity="0.9" />
        <rect x="170" y="40" width="38" height="26" rx="7" fill="#3f3327" />
        <rect x="156" y="150" width="66" height="86" rx="10" fill="#fffdf8" />
        <text x="189" y="182" textAnchor="middle" fontSize="15" fontWeight="700" fill={a} fontFamily="Inter, sans-serif">
          {exp.primaryOil}
        </text>
        <line x1="166" y1="192" x2="212" y2="192" stroke={a} strokeWidth="1.4" opacity="0.5" />
        <text x="189" y="208" textAnchor="middle" fontSize="9" fontWeight="600" fill={a} opacity="0.75" fontFamily="Inter, sans-serif">
          BATH OIL
        </text>
      </g>
    </svg>
  );
}
