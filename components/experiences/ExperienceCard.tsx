import Link from "next/link";
import Image from "next/image";
import { ClockIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { ExperienceIcon } from "./ExperienceIcon";
import type { Experience } from "@/config/experiences";

export function ExperienceCard({
  exp,
  onLearnMore,
}: {
  exp: Experience;
  onLearnMore?: () => void;
}) {
  const learnMoreClass =
    "inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-2 text-[14px] font-semibold text-olive-dark";
  const learnMoreInner = (
    <>
      Learn More
      <ArrowRightIcon size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
    </>
  );
  const [r, g, b] = exp.glowRgb.split(",").map(Number);
  const badgeBg = `rgba(${exp.glowRgb},0.18)`;
  const badgeText = `rgb(${Math.round(r * 0.68)},${Math.round(g * 0.68)},${Math.round(b * 0.68)})`;

  // Icon above content, never beside it. In a 2-up grid each card is roughly
  // half the old width, and the old icon-column-plus-text split left the
  // description as a narrow ribbon. h-full keeps a pair in a row level.
  return (
    <article className="group flex h-full flex-col gap-4 rounded-[22px] border border-[rgba(130,105,76,0.12)] bg-[rgba(255,250,241,0.95)] p-5 shadow-[0_8px_30px_rgba(83,66,46,0.06)] transition-[transform,box-shadow] duration-[240ms] ease-out hover:-translate-y-[3px] hover:shadow-[0_16px_40px_rgba(83,66,46,0.11)] sm:gap-5 sm:p-7">
      {/* Icon area — soft radial glow, no visible box */}
      <div className="relative flex min-h-[120px] items-center justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-[240ms] group-hover:opacity-100"
          style={{ background: `radial-gradient(circle at 50% 48%, rgba(${exp.glowRgb},0.20), transparent 70%)` }}
        />
        {exp.image ? (
          <Image
            src={exp.image}
            alt={`${exp.name} icon`}
            width={96}
            height={96}
            className="relative h-20 w-20 object-contain drop-shadow-[0_6px_14px_rgba(83,66,46,0.14)]"
          />
        ) : (
          <span
            className="relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-[var(--shadow-warm)]"
            style={{ background: exp.iconBg }}
          >
            <ExperienceIcon name={exp.icon} size={40} />
          </span>
        )}
      </div>

      {/* Content — flex-1 so the meta row below still sits at the card's foot */}
      <div className="flex flex-1 flex-col">
        <h3 className="text-[24px] leading-[1.1] text-olive-dark sm:text-[26px]">{exp.name}</h3>
        <span
          className="mt-1.5 inline-block w-fit rounded-full px-2.5 py-1.5 text-[12.5px] font-semibold leading-none"
          style={{ background: badgeBg, color: badgeText }}
        >
          {exp.ingredients}
        </span>
        <p className="mt-2.5 text-[16px] font-medium text-brown">{exp.tagline}</p>
        <p className="mt-1 max-w-[620px] text-[15px] leading-[1.5] text-muted">{exp.description}</p>

        {/* Perfect for */}
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-olive">Perfect for</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {exp.perfectFor.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-ivory px-2.5 py-1 text-[12px] font-medium text-olive-dark"
              >
                <CheckIcon size={13} style={{ color: exp.accent }} />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Meta row pinned toward the bottom */}
        <div className="mt-auto flex items-center justify-between gap-4 pt-4">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-olive">
            <ClockIcon size={16} />
            {exp.duration}
          </span>
          {onLearnMore ? (
            <button
              type="button"
              onClick={onLearnMore}
              aria-label={`Learn more about ${exp.name}`}
              className={learnMoreClass}
            >
              {learnMoreInner}
            </button>
          ) : (
            <Link href="/#reserve" aria-label={`Learn more and book ${exp.name}`} className={learnMoreClass}>
              {learnMoreInner}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
