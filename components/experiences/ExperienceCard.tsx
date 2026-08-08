import Link from "next/link";
import Image from "next/image";
import { ClockIcon, ArrowRightIcon } from "@/components/ui/icons";
import { ExperienceIcon } from "./ExperienceIcon";
import type { Experience } from "@/config/experiences";

export function ExperienceCard({ exp }: { exp: Experience }) {
  return (
    <article className="group grid grid-cols-1 gap-4 rounded-[22px] border border-[rgba(130,105,76,0.12)] bg-[rgba(255,250,241,0.95)] p-6 shadow-[0_8px_30px_rgba(83,66,46,0.06)] transition duration-[250ms] ease-out hover:-translate-y-[3px] hover:shadow-[0_14px_38px_rgba(83,66,46,0.10)] sm:grid-cols-[minmax(0,32%)_1fr] sm:items-center sm:gap-6 sm:p-8">
      {/* Icon in a soft colour glow (replaces the card mascot art) */}
      <div className="relative flex items-center justify-center py-2">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(circle at 50% 45%, rgba(${exp.glowRgb},0.16), transparent 70%)` }}
        />
        {exp.image ? (
          <Image
            src={exp.image}
            alt={`${exp.name} icon`}
            width={104}
            height={104}
            className="relative h-24 w-24 object-contain drop-shadow-[0_6px_14px_rgba(83,66,46,0.14)]"
          />
        ) : (
          <span
            className="relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-[var(--shadow-warm)]"
            style={{ background: exp.iconBg }}
          >
            <ExperienceIcon name={exp.icon} size={46} />
          </span>
        )}
      </div>

      <div>
        <h3 className="text-[24px] leading-tight text-olive-dark sm:text-[26px]">{exp.name}</h3>
        <span
          className="mt-2 inline-block rounded-full px-3 py-1 text-[13px] font-semibold"
          style={{ background: `rgba(${exp.glowRgb},0.16)`, color: exp.iconBg }}
        >
          {exp.ingredients}
        </span>
        <p className="mt-2.5 text-[17px] font-medium text-brown">{exp.tagline}</p>
        <p className="mt-1.5 text-[16px] leading-relaxed text-muted">{exp.description}</p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-[15px] font-medium text-olive">
            <ClockIcon size={18} />
            {exp.duration}
          </span>
          <Link
            href="/#reserve"
            aria-label={`Learn more and book ${exp.name}`}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-2 text-[15px] font-semibold text-olive-dark"
          >
            Learn More
            <ArrowRightIcon size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
