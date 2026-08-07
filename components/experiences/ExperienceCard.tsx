import Link from "next/link";
import { Lotti } from "@/components/ui/Lotti";
import { ClockIcon, ArrowRightIcon } from "@/components/ui/icons";
import type { Experience } from "@/config/experiences";

// Soft cream/sage/coral glow behind Lotti so she blends into the card rather
// than sitting in an image box.
const GLOWS: Record<Experience["glow"], string> = {
  sage: "radial-gradient(circle at 50% 45%, rgba(221,230,214,0.85), transparent 70%)",
  coral: "radial-gradient(circle at 50% 45%, rgba(244,196,174,0.7), transparent 70%)",
  teal: "radial-gradient(circle at 50% 45%, rgba(23,105,109,0.16), transparent 70%)",
  sand: "radial-gradient(circle at 50% 45%, rgba(234,220,197,0.85), transparent 70%)",
};

export function ExperienceCard({ exp }: { exp: Experience }) {
  return (
    <article
      className="group grid grid-cols-1 gap-4 rounded-[22px] border border-[rgba(130,105,76,0.12)] bg-[rgba(255,250,241,0.95)] p-6 shadow-[0_8px_30px_rgba(83,66,46,0.06)] transition duration-[250ms] ease-out hover:-translate-y-[3px] hover:shadow-[0_14px_38px_rgba(83,66,46,0.10)] sm:grid-cols-[minmax(0,32%)_1fr] sm:items-center sm:gap-6 sm:p-8"
    >
      <div className="relative flex items-center justify-center py-2">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: GLOWS[exp.glow] }} />
        <Lotti
          size={168}
          alt={`Lotti enjoying the ${exp.name} experience`}
          className="relative h-auto w-36 sm:w-40"
        />
      </div>

      <div>
        <h3 className="text-[24px] leading-tight text-olive-dark sm:text-[26px]">{exp.name}</h3>
        <p className="mt-1 text-[17px] font-medium text-brown">{exp.tagline}</p>
        <p className="mt-2 text-[16px] leading-relaxed text-muted">{exp.description}</p>

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
