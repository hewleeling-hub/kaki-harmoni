import type { ReactNode } from "react";

/* ----------------------------- StepCard ---------------------------- */

export function StepCard({
  number,
  title,
  description,
  icon,
  align = "left",
}: {
  number: number;
  title: string;
  description: string;
  icon?: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-[22px] border border-line bg-beige/40 p-6 shadow-[var(--shadow-warm)] sm:flex-row sm:items-center ${
        align === "right" ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-olive text-ivory">
        {icon ?? <span className="text-2xl font-bold">{number}</span>}
      </div>
      <div>
        <span className="text-sm font-bold uppercase tracking-wide text-olive">Step {number}</span>
        <h3 className="mt-1 text-[20px] text-olive-dark">{title}</h3>
        <p className="mt-1 text-[16px] leading-relaxed text-muted">{description}</p>
      </div>
    </div>
  );
}

/* -------------------------- PromotionCard -------------------------- */

export function PromotionCard({
  highlight,
  title,
  description,
  terms,
}: {
  highlight: string;
  title: string;
  description: string;
  terms?: string;
}) {
  return (
    <div className="rounded-[22px] border border-gold/40 bg-[linear-gradient(150deg,#FBEFD6_0%,#F3E3C4_100%)] p-6 shadow-[var(--shadow-warm)]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-3xl font-bold text-[#7a5410]" style={{ fontFamily: "var(--font-heading)" }}>
          {highlight}
        </span>
        <h3 className="text-[20px] text-olive-dark">{title}</h3>
      </div>
      <p className="mt-2 text-[16px] leading-relaxed text-brown">{description}</p>
      {terms && <p className="mt-3 text-[14px] text-muted">{terms}</p>}
    </div>
  );
}

/* --------------------------- OpeningBadge -------------------------- *
 * Honest pre-launch status pill (we're not open yet).
 */
export function OpeningBadge({ when }: { when: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3 py-1 text-sm font-semibold text-[#7a5410]">
      <span className="h-2.5 w-2.5 rounded-full bg-gold" aria-hidden />
      Opening {when}
    </span>
  );
}
