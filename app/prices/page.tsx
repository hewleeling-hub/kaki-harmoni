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
  telLink,
} from "@/config/business";
import { reserveHref, isOnSale, PACKAGES_ON_SALE, type CatalogueSlug } from "@/config/catalogue";

export const metadata: Metadata = {
  title: "Prices & Packages — Kaki Harmoni",
  description:
    "Try your first 15-minute soak for RM25, then choose how often you come: the 5-Day Reset works out at RM32 a visit, with longer routines available.",
};

function PriceTile({
  name,
  slug,
  price,
  detail,
  save,
  perSession,
  featured,
}: {
  name: string;
  /** Catalogue entry this tile sells, so the button books this exact thing. */
  slug: CatalogueSlug;
  price: number;
  detail: string;
  save?: number;
  perSession?: number;
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
      {perSession ? (
        <p className="mt-1 text-[15px] font-semibold text-brown">RM{perSession} a session</p>
      ) : null}
      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{detail}</p>
      {/* Only offer a button for what checkout can actually sell today. A
          package tile keeps its price and its pitch, but sends people to the
          team rather than to a checkout that would show them a single soak.

          The fallback still gives an action they can take right now: "sign up
          at the shop" left an interested customer with nothing to click, so
          they book the slot online and settle the package in person. */}
      {isOnSale(slug) ? (
        <Button href={reserveHref(slug)} variant="secondary" full className="mt-5">
          Book {name}
        </Button>
      ) : (
        <p className="mt-5 rounded-[18px] border border-dashed border-line bg-cream/50 px-4 py-3 text-[14px] leading-relaxed text-muted">
          <a href={reserveHref()} className="font-semibold text-olive underline underline-offset-2 hover:text-olive-dark">
            Book your first session online
          </a>{" "}
          and pay at the shop.
        </p>
      )}
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
            <Button href={reserveHref("first-soak")} full className="mt-5" icon={<CalendarIcon size={20} />}>
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
            <Button href={reserveHref("first-soak")} variant="secondary" full className="mt-5">
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
          The more often you come, the less each visit costs — from RM40 for a one-off down to
          RM28 a visit on the 30-Day Routine.
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
          title="Single soak rate"
          subtitle="One price, any time of day — no peak or off-peak to work around."
        />
        {/* Grid only splits once there is more than one rate to show. */}
        <div className={`mt-6 grid gap-5 ${sessionRates.length > 1 ? "sm:grid-cols-3" : "mx-auto max-w-md"}`}>
          {sessionRates.map((r) => (
            <PriceTile key={r.name} name={r.name} slug={r.slug} price={r.price} detail={r.detail} featured={r.name === "Standard single"} />
          ))}
        </div>
      </section>

      {/* ── Staying longer ──────────────────────────────────────────────── */}
      {/* Target of the homepage's "Want longer? Stay for two soaks." link, so the
          anchor and the heading have to answer that exact question. */}
      <section id="longer" className="mt-12 scroll-mt-24">
        <SectionHeading
          eyebrow="Also available"
          title="Staying longer?"
          subtitle="Fifteen minutes is the usual visit, not a limit — you're welcome to go back to back."
        />
        {/* Grid only splits once there is more than one pass to show. */}
        <div className={`mt-6 grid gap-5 ${OTHER_PASSES.length > 1 ? "sm:grid-cols-2" : "mx-auto max-w-md"}`}>
          {OTHER_PASSES.map((p) => (
            <PriceTile
              key={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              detail={p.detail}
              save={p.save}
              perSession={p.perSession}
            />
          ))}
        </div>
        <p className="mt-4 text-[14px] text-muted">
          {PACKAGES_ON_SALE
            ? "Book any package right here — or ask our team in store or on WhatsApp if you'd rather set it up with a person."
            : "Book your first session online and pay at the shop — our team will set the package up for you there. Message us on WhatsApp if you'd like to talk it through first."}
        </p>
      </section>

      {/* ── What's included ─────────────────────────────────────────────── */}
      <section className="mt-12">
        <SectionHeading title="What's included" />
        <Card className="mt-5 bg-cream/60">
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "A warm 15-minute leg soak",
              // Coffee only — tea isn't stocked. See the drinks note in the FAQ.
              "A freshly made coffee",
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
            description={`Come once, see how it feels, and think about a routine afterwards. Your first visit is RM${pricing.prepay} prepaid online, or RM${pricing.walkin} at the door, instead of the usual RM${pricing.normal}.`}
            terms={`${launchOfferNote} First visits from ${bookingStartLabel}. After the launch period a first visit is the usual RM${pricing.normal}.`}
          />
        </div>
      </section>

      <NextStep
        title="Questions about anything?"
        body="Prices, packages, what to expect on the day — ask us whatever you like. Message us, or give us a call if you'd rather talk."
        cta={ctaLabels.firstVisit}
        href="/#reserve"
        secondary={{
          label: "Ask us on WhatsApp",
          href: whatsappLink("Hi Kaki Harmoni! I have a question I'd like to ask."),
        }}
        phone={{ label: `Call ${businessConfig.callDisplay}`, href: telLink }}
      />
    </PublicShell>
  );
}
