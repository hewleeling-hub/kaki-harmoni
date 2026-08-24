import Link from "next/link";
import Image from "next/image";
import { experiences } from "@/config/experiences";
import { ExperienceIcon } from "./ExperienceIcon";

/**
 * Compact homepage teaser: the four moods, name and tagline only.
 *
 * The homepage used to render <ExperienceList /> and <CustomBlendNote /> —
 * literally the content of /experiences — and then link to /experiences to
 * see the same thing again. The full cards, the "perfect for" chips, the
 * custom-blend callout and the Learn More modal now live only on that page;
 * this just says the four exist and sends you there.
 */
export function ExperiencePreview() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {experiences.map((exp) => (
        <li key={exp.id}>
          <Link
            href="/experiences"
            className="group flex h-full flex-col items-center gap-3 rounded-[22px] border border-line bg-ivory p-6 text-center shadow-[var(--shadow-warm)] transition duration-200 ease-out hover:-translate-y-[3px] hover:shadow-[0_16px_40px_rgba(83,66,46,0.11)]"
          >
            <span className="relative flex h-20 w-20 items-center justify-center">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-200 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 50% 48%, rgba(${exp.glowRgb},0.20), transparent 70%)`,
                }}
              />
              {exp.image ? (
                <Image
                  src={exp.image}
                  alt=""
                  width={80}
                  height={80}
                  className="relative h-16 w-16 object-contain drop-shadow-[0_6px_14px_rgba(83,66,46,0.14)]"
                />
              ) : (
                <span
                  className="relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-[var(--shadow-warm)]"
                  style={{ background: exp.iconBg }}
                >
                  <ExperienceIcon name={exp.icon} size={32} />
                </span>
              )}
            </span>
            <h3 className="text-[20px] leading-tight text-olive-dark">{exp.name}</h3>
            <p className="text-[15px] leading-relaxed text-muted">{exp.tagline}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
