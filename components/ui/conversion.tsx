import Link from "next/link";
import { Card, Badge, SectionHeading, Button } from "@/components/ui/primitives";
import { CheckIcon, ArrowRightIcon } from "@/components/ui/icons";
import {
  routinePackages,
  perVisitPrice,
  packagePicker,
  whyNotAtHome,
  testimonials,
  experienceVideo,
  launchOfferBadge,
  type RoutinePackage,
} from "@/config/business";
import { isOnSale } from "@/config/catalogue";

/* --------------------------- RoutineCard ---------------------------- *
 * One rung of the TRY → RESET → ROUTINE → RITUAL ladder. Leads with how
 * often you come, not with the size of the discount.
 */
function RoutineCard({ pkg }: { pkg: RoutinePackage }) {
  const perVisit = perVisitPrice(pkg);
  const priceKnown = pkg.price !== null;

  return (
    <Card
      className={`flex h-full flex-col text-center ${
        pkg.featured ? "ring-2 ring-olive/50" : ""
      }`}
    >
      <span className="mx-auto flex flex-wrap items-center justify-center gap-2">
        <Badge tone={pkg.featured ? "olive" : "sage"}>{pkg.stage}</Badge>
        {/* Gold marks a time-limited price — same device as the "Save RMx" badge,
            rather than a watermark, which would read as DRAFT over the price. */}
        {pkg.limitedTime && <Badge tone="gold">{launchOfferBadge}</Badge>}
      </span>

      <h3 className="mt-3 text-[20px] text-olive-dark">{pkg.name}</h3>
      <p className="mt-1 text-[15px] font-semibold uppercase tracking-wide text-muted">
        {pkg.visits === 1 ? "1 visit" : `${pkg.visits} visits`}
      </p>

      {priceKnown ? (
        <>
          <p
            className="mt-3 text-4xl font-bold text-olive"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            RM{pkg.price}
          </p>
          {perVisit !== null && pkg.visits > 1 && (
            <p className="mt-1 text-[15px] font-semibold text-brown">RM{perVisit} per visit</p>
          )}
          {pkg.priceNote && <p className="mt-1 text-[14px] text-muted">{pkg.priceNote}</p>}
        </>
      ) : (
        /* No invented numbers: the tier is shown, the price is honestly pending. */
        <p className="mt-3 text-[19px] font-semibold leading-snug text-brown">
          Price to be confirmed
        </p>
      )}

      <p className="mt-3 flex-1 text-[16px] leading-relaxed text-muted">{pkg.positioning}</p>

      {priceKnown && !isOnSale(pkg.slug) ? (
        /* Priced and real, but not sellable online yet. The tier keeps its
           pitch; the action becomes the one we can actually honour, rather
           than a "MAKE IT MY ROUTINE" button that lands on a checkout
           offering a single soak. */
        <p className="mt-5 rounded-[18px] border border-dashed border-line bg-cream/50 px-4 py-3 text-[15px] text-muted">
          Ask our team to set this up — in store or on WhatsApp.
        </p>
      ) : priceKnown ? (
        <Button href={pkg.href} full className="mt-5" variant={pkg.featured ? "primary" : "secondary"}>
          {pkg.cta}
        </Button>
      ) : (
        <p className="mt-5 rounded-[18px] border border-dashed border-line bg-cream/50 px-4 py-3 text-[15px] text-muted">
          Ask us about this one — we&apos;ll have the price soon.
        </p>
      )}
    </Card>
  );
}

/* -------------------------- RoutineLadder --------------------------- */

export function RoutineLadder({ className = "" }: { className?: string }) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {routinePackages.map((pkg) => (
        <RoutineCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}

/* -------------------------- PackagePicker --------------------------- *
 * Answers "which package is right for me?" rather than "which price do I
 * want?". A list on mobile, a table from sm up.
 */
export function PackagePicker({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      {/* Mobile: stacked rows, no horizontal scrolling. */}
      <ul className="grid gap-3 sm:hidden">
        {packagePicker.map((row) => (
          <li key={row.id} className="rounded-[20px] border border-line bg-ivory p-5 shadow-[var(--shadow-warm)]">
            <p className="text-[16px] leading-relaxed text-muted">If you {row.when.toLowerCase()}…</p>
            <p className="mt-2 text-[19px] font-semibold text-olive-dark">{row.recommend}</p>
          </li>
        ))}
      </ul>

      {/* Small screens and up: a simple two-column table. */}
      <div className="hidden overflow-hidden rounded-[22px] border border-line bg-ivory shadow-[var(--shadow-warm)] sm:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-cream/70">
              <th scope="col" className="px-6 py-4 text-[16px] font-semibold text-olive-dark">
                If you…
              </th>
              <th scope="col" className="px-6 py-4 text-[16px] font-semibold text-olive-dark">
                We recommend…
              </th>
            </tr>
          </thead>
          <tbody>
            {packagePicker.map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="px-6 py-4 text-[17px] text-muted">{row.when}</td>
                <td className="px-6 py-4 text-[17px] font-semibold text-olive-dark">{row.recommend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --------------------------- WhyNotAtHome --------------------------- */

export function WhyNotAtHome({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-2 ${className}`}>
      {whyNotAtHome.map((reason) => (
        <li
          key={reason.title}
          className="flex items-start gap-3 rounded-[20px] border border-line bg-ivory p-5 shadow-[var(--shadow-warm)]"
        >
          <CheckIcon size={22} className="mt-0.5 shrink-0 text-success" />
          <div>
            <h3 className="text-[17px] text-olive-dark">{reason.title}</h3>
            <p className="mt-1 text-[16px] leading-relaxed text-muted">{reason.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------- Testimonials --------------------------- *
 * Renders NOTHING until there are genuine guest reviews to show. Kaki
 * Harmoni opens on 11 September 2026, so this is empty by design — an
 * invented quote would be worse than no section at all.
 */
export function Testimonials({ className = "" }: { className?: string }) {
  if (testimonials.length === 0) return null;

  return (
    <section className={`py-10 ${className}`}>
      <SectionHeading
        center
        eyebrow="Social proof"
        title="What our guests say"
        subtitle="Real words from real people who&rsquo;ve soaked with us."
      />
      <div className="mx-auto mt-8 grid max-w-4xl gap-5 sm:grid-cols-2">
        {testimonials.map((t) => (
          <figure
            key={`${t.name}-${t.quote.slice(0, 24)}`}
            className="flex flex-col rounded-[22px] border border-line bg-ivory p-6 shadow-[var(--shadow-warm)]"
          >
            <blockquote className="flex-1 text-[17px] leading-relaxed text-brown">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-4">
              {t.photo && (
                /* Guest photos are used only with permission. */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.photo}
                  alt=""
                  className="h-12 w-12 rounded-full border border-line object-cover"
                />
              )}
              <span>
                <span className="block text-[16px] font-semibold text-olive-dark">{t.name}</span>
                {t.detail && <span className="block text-[15px] text-muted">{t.detail}</span>}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ------------------------- ExperienceVideo -------------------------- *
 * Real Kaki Harmoni footage only. Renders nothing while there is none,
 * rather than dropping in stock video.
 */
export function ExperienceVideo({ className = "" }: { className?: string }) {
  if (!experienceVideo.src) return null;

  return (
    <section className={`py-10 ${className}`}>
      <SectionHeading center eyebrow="A look inside" title="Fifteen minutes at Kaki Harmoni" />
      <figure className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-[24px] border border-line shadow-[var(--shadow-warm)]">
        <video
          src={experienceVideo.src}
          poster={experienceVideo.poster}
          controls
          playsInline
          preload="metadata"
          className="h-auto w-full"
        />
        {experienceVideo.caption && (
          <figcaption className="bg-ivory px-5 py-3 text-[15px] text-muted">
            {experienceVideo.caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}

/* ---------------------------- NextStep ------------------------------ *
 * Every major page should end with one obvious next action.
 */
export function NextStep({
  title,
  body,
  cta,
  href,
  secondary,
  phone,
}: {
  title: string;
  body: string;
  cta: string;
  href: string;
  secondary?: { label: string; href: string };
  /** A number to ring, for people who would rather not use WhatsApp. */
  phone?: { label: string; href: string };
}) {
  return (
    <section className="py-10">
      <div className="rounded-[24px] border border-line bg-beige/60 p-8 text-center shadow-[var(--shadow-warm)]">
        <h2 className="text-[26px] text-olive-dark sm:text-[30px]">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-[17px] leading-relaxed text-brown">{body}</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href={href} size="lg" iconRight={<ArrowRightIcon size={20} />}>
            {cta}
          </Button>
          {secondary && (
            <Link
              href={secondary.href}
              className="text-[16px] font-semibold text-olive underline underline-offset-4 hover:text-olive-dark"
            >
              {secondary.label}
            </Link>
          )}
          {phone && (
            <a
              href={phone.href}
              className="text-[16px] font-semibold text-olive underline underline-offset-4 hover:text-olive-dark"
            >
              {phone.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
