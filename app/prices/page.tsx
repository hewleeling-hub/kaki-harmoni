import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading, Card, Button, Badge } from "@/components/ui/primitives";
import { PromotionCard } from "@/components/ui/cards";
import { RoutineLadder, PackagePicker, NextStep } from "@/components/ui/conversion";
import { CalendarIcon, CheckIcon } from "@/components/ui/icons";
import {
  businessConfig,
  sessionRates,
  packages,
  whatsappLink,
  ctaLabels,
  launchOfferNote,
  launchOfferShort,
} from "@/config/business";

export const metadata: Metadata = {
  title: "Prices & Packages — Kaki Harmoni",
  description:
    "Try your first 15-minute soak for RM25, then choose how often you come: the 5-Day Reset works out at RM32 a visit, with longer routines available.",
};

function PriceTile({
  name,
  price,
  detail,
  save,
  featured,
}: {
  name: string;
  price: number;
  detail: string;
  save?: number;
  featured?: boolean;
}) {
  return (
    <Card className={`flex flex-col text-center ${featured ? "ring-2 ring-olive/50" : ""}`}>
      {save ? (
        <span className="mx-auto mb-1">
          <Badge tone="gold">Save RM{save}</Badge>
        </span>
      ) : null}
      <h3 className="text-[18px] text-olive-dark">{name}</h3>
      <p className="mt-2 text-4xl font-bold text-olive" style={{ fontFamily: "var(--font-heading)" }}>
        RM{price}
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{detail}</p>
    </Card>
  );
}

/* The "Buy 4, get 1 free" package is presented on this page as the 5-Day
 * Reset, so it is filtered out of the extras list to avoid showing the same
 * product twice under two different names. Matched on id, not name, so the
 * copy can change without silently un-filtering it. */
const OTHER_PASSES = packages.filter((p) => p.id !== "five-for-four");

export default function PricesPage() {
  const { pricing, bookingStartLabel } = businessConfig;

  return (
    <PublicShell>
      <PageHeader
        title="Prices & Packages"
        subtitle="Start with one soak. If it suits you, choose how often you'd like to come."
      >
        <Button href="/#reserve" size="lg" icon={<CalendarIcon size={22} />} className="hidden sm:inline-flex">
          {ctaLabels.firstVisit}
        </Button>
      </PageHeader>

      {/* ── Start here ──────────────────────────────────────────────────── */}
      <section className="mt-8">
        <SectionHeading eyebrow="New here?" title="Your first visit" />
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Card className="flex flex-col text-center ring-2 ring-olive/50">
            <p className="text-sm font-semibold uppercase tracking-wide text-olive">Prepay online · best value</p>
            <p className="mt-3 text-5xl font-bold text-olive" style={{ fontFamily: "var(--font-heading)" }}>
              RM{pricing.prepay}
            </p>
            <p className="mt-1 text-[15px] text-muted line-through">Usually RM{pricing.normal}</p>
            <p className="mt-1 text-[14px] font-semibold text-olive">{launchOfferShort}</p>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">
              A warm 15-minute leg soak and a coffee — an easy way to see whether it suits you.
            </p>
            <Button href="/#reserve" full className="mt-5" icon={<CalendarIcon size={20} />}>
              {ctaLabels.firstVisit}
            </Button>
          </Card>

          <Card className="flex flex-col text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brown">Pay at the door</p>
            <p className="mt-3 text-5xl font-bold text-brown" style={{ fontFamily: "var(--font-heading)" }}>
              RM{pricing.walkin}
            </p>
            <p className="mt-1 text-[15px] text-muted">First visit</p>
            <p className="mt-1 text-[14px] font-semibold text-brown">{launchOfferShort}</p>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">
              Reserve your spot now and settle when you arrive. Same warm soak and coffee.
            </p>
            <Button href="/#reserve" variant="secondary" full className="mt-5">
              Reserve your spot
            </Button>
          </Card>
        </div>
      </section>

      {/* ── The routine ladder ──────────────────────────────────────────── */}
      <section className="mt-12">
        <SectionHeading
          eyebrow="Try → Reset → Routine → Ritual"
          title="How often would you like to come?"
          subtitle="These aren't really discounts — they're the easiest way to turn fifteen minutes into a habit."
        />
        <RoutineLadder className="mt-6" />
        <p className="mt-4 text-[15px] text-muted">
          Prices for the 10-Day Reset and 30-Day Routine are still being finalised — message us
          and we&rsquo;ll let you know as soon as they&rsquo;re set.
        </p>
      </section>

      {/* ── Decision helper ─────────────────────────────────────────────── */}
      <section className="mt-12">
        <SectionHeading title="Which one is right for me?" />
        <PackagePicker className="mt-6" />
      </section>

      {/* ── Single soaks ────────────────────────────────────────────────── */}
      <section className="mt-12">
        <SectionHeading
          eyebrow="Coming now and then"
          title="Single soak rates"
          subtitle="RM40 for a standard soak, with friendlier rates at quieter times."
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {sessionRates.map((r) => (
            <PriceTile key={r.name} name={r.name} price={r.price} detail={r.detail} featured={r.name === "Standard single"} />
          ))}
        </div>
      </section>

      {/* ── Other passes ────────────────────────────────────────────────── */}
      <section className="mt-12">
        <SectionHeading
          eyebrow="Also available"
          title="Other passes"
          subtitle="Two soaks back to back for a longer sit, and a pass for Desa Cindaimas residents."
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {OTHER_PASSES.map((p) => (
            <PriceTile key={p.name} name={p.name} price={p.price} detail={p.detail} save={"save" in p ? p.save : undefined} />
          ))}
        </div>
        <p className="mt-4 text-[14px] text-muted">
          Resident pass requires proof of residence. Ask our team in store or on WhatsApp to set up any package.
        </p>
      </section>

      {/* ── What's included ─────────────────────────────────────────────── */}
      <section className="mt-12">
        <SectionHeading title="What's included" />
        <Card className="mt-5 bg-cream/60">
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "A warm 15-minute leg soak",
              "A freshly made coffee or tea",
              "A comfortable place to rest",
              "Time to relax and reconnect",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[16px] text-brown">
                <CheckIcon size={20} className="mt-0.5 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
        <div className="mt-5">
          <PromotionCard
            highlight={`RM${pricing.prepay}`}
            title="No need to decide today"
            description={`Come once, see how it feels, and think about a routine afterwards. Your first visit is RM${pricing.prepay} prepaid instead of the usual RM${pricing.normal}.`}
            terms={`${launchOfferNote} First visits from ${bookingStartLabel}. After the launch period a first visit is the usual RM${pricing.normal}.`}
          />
        </div>
      </section>

      <NextStep
        title="Questions about prices?"
        body="We're happy to help — message us anytime and we'll talk you through it."
        cta={ctaLabels.firstVisit}
        href="/#reserve"
        secondary={{ label: "Ask us on WhatsApp", href: whatsappLink("Hi Kaki Harmoni! I have a question about prices and packages.") }}
      />
    </PublicShell>
  );
}
