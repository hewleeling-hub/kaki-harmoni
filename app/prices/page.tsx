import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PublicShell } from "@/components/layout/PublicShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading, Card, Button, Badge } from "@/components/ui/primitives";
import { PromotionCard } from "@/components/ui/cards";
import { PromoBanner } from "@/components/ui/PromoBanner";
import { firstVisitPaused } from "@/config/promotions";
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

/**
 * Re-rendered every ten minutes so the short-run offer band appears and
 * disappears on its own. This page is otherwise static, which would freeze the
 * date check at build time — the offer would either never show or never stop.
 */
export const revalidate = 600;

export const metadata: Metadata = pageMetadata({
  title: "Prices & Packages — Kaki Harmoni",
  description:
    "A 15-minute soak is RM40, or less with a package: the 5-Day Reset works out at RM32 a visit, down to RM28 on the 30-Day Routine.",
  path: "/prices",
});

function PriceTile({
  name,
  slug,
  price,
  detail,
  save,
  perSession,
  featured,
  offerPrice,
  offerNote,
}: {
  name: string;
  /** Catalogue entry this tile sells, so the button books this exact thing. */
  slug: CatalogueSlug;
  price: number;
  detail: string;
  save?: number;
  perSession?: number;
  featured?: boolean;
  /** Offer price for this tile, struck against the standing one. */
  offerPrice?: number;
  /** The conditions that make the offer price true. Never show one without it. */
  offerNote?: string;
}) {
  return (
    <Card className={`flex flex-col text-center ${featured ? "ring-2 ring-olive/50" : ""}`}>
      {save ? (
        <span className="mx-auto mb-1">
          <Badge tone="gold">Save RM{save}</Badge>
        </span>
      ) : null}
      <h3 className="text-[18px] text-olive-dark">{name}</h3>
      {offerPrice !== undefined ? (
        /* The standing price stays visible and struck through rather than being
           swapped out: the saving is the point, and a lone RM11 says nothing
           about what it is cheaper than. */
        <p className="mt-2 flex items-baseline justify-center gap-2.5">
          <span
            className="text-[26px] font-bold text-muted line-through"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            RM{price}
          </span>
          <span
            className="text-4xl font-bold text-[#7a5410]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            RM{offerPrice}
          </span>
        </p>
      ) : (
        <p className="mt-2 text-4xl font-bold text-olive" style={{ fontFamily: "var(--font-heading)" }}>
          RM{price}
        </p>
      )}
      {offerNote ? (
        /* The conditions ride with the price. RM11 shown bare would read as a
           walk-in rate, which it is not — it is a voucher, capped and dated. */
        <p className="mt-1.5 text-[14px] font-semibold leading-snug text-[#7a5410]">{offerNote}</p>
      ) : null}
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
      {offerPrice !== undefined ? (
        /* The headline price on this tile is the VOUCHER price, and a voucher
           is not something checkout sells — booking this slug charges the
           standing RM{price}. Leading with "Book" under a big RM11 would take
           someone to a RM40 checkout, which is the sort of surprise that gets
           argued about at the counter. The offer price gets the offer's
           button; the standing price stays available underneath it. */
        <>
          <Button href="/#voucher" full className="mt-5">
            Get the RM{offerPrice} voucher
          </Button>
          {isOnSale(slug) ? (
            <a
              href={reserveHref(slug)}
              className="mt-3 text-[14px] font-semibold text-olive underline underline-offset-2 hover:text-olive-dark"
            >
              Or book a single soak at RM{price}
            </a>
          ) : null}
        </>
      ) : isOnSale(slug) ? (
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
  const { pricing } = businessConfig;

  /* The RM30 first visit is not promoted while the 11.11 voucher is on sale —
     see firstVisitPaused(). The standing rates below stay exactly as they are;
     only the introductory pitch pauses. */
  const pauseFirstVisit = firstVisitPaused();

  return (
    <PublicShell>
      {/* No CTA in the header. "Your first visit" sits directly beneath it
          with the same ask, so the two buttons were within a screen of each
          other — and the header one came before the price it was quoting. */}
      <PageHeader
        title="Prices & Packages"
        subtitle="Start with one soak. If it suits you, choose how often you'd like to come."
      />

      {/* Above the standing prices on this page only: somebody who came here
          came to compare prices, and a one-day price they'd miss by scrolling
          past is the one thing worth interrupting that for. */}
      <div className="mt-8">
        <PromoBanner />
      </div>

      {/* ── Start here ──────────────────────────────────────────────────── */}
      {pauseFirstVisit ? (
        /* While the voucher runs, the cheapest way to try us IS the voucher.
           Showing RM30 beside RM11 invites the obvious question and answers it
           badly. The VoucherBanner above already carries the offer and its
           terms, so this only needs to point at it. */
        <section className="mt-8">
          <SectionHeading
            eyebrow="New here?"
            title="Start with the 11.11 voucher"
            subtitle="A 15-minute soak for RM11 — the cheapest way to try us while the offer runs. The standing rates below apply after it."
          />
        </section>
      ) : (
      <section className="mt-8">
        <SectionHeading eyebrow="New here?" title="Your first visit" />
        {/* One price, so one card. Two tiles here used to contrast RM25
            prepaid against RM30 at the door; with the prices equal, a
            side-by-side comparison would imply a difference that isn't there. */}
        <div className="mt-5 flex justify-center">
          <Card className="flex w-full max-w-md flex-col text-center ring-2 ring-olive/50">
            <p className="text-sm font-semibold uppercase tracking-wide text-olive">First visit</p>
            <p className="mt-3 text-5xl font-bold text-olive" style={{ fontFamily: "var(--font-heading)" }}>
              RM{pricing.firstVisit}
            </p>
            <p className="mt-1 text-[15px] text-muted line-through">Usually RM{pricing.normal}</p>
            <p className="mt-1 text-[14px] font-semibold text-olive">{launchOfferShort}</p>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">
              A warm 15-minute leg soak — an easy way to see whether it suits you.
            </p>
            <p className="mt-2 text-[15px] text-brown">
              Pay online or at the door — the price is the same either way.
            </p>
            <Button href={reserveHref("first-soak")} full className="mt-5" icon={<CalendarIcon size={20} />}>
              {pauseFirstVisit ? ctaLabels.reserve : ctaLabels.firstVisit}
            </Button>
          </Card>
        </div>
      </section>
      )}

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
            <PriceTile
              key={r.name}
              name={r.name}
              slug={r.slug}
              price={r.price}
              detail={r.detail}
              featured={r.name === "Standard single"}
              offerPrice={pauseFirstVisit ? 11 : undefined}
              offerNote={
                pauseFirstVisit
                  ? "With an 11.11 voucher — buy by 11 Nov, 2 per person, redeem by 31 Dec"
                  : undefined
              }
            />
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
          {/* Says the whole arrangement, because half of it is a surprise
              otherwise: you book online but you don't pay online. A guest who
              expects a payment screen and reaches "settle at the shop" will
              wonder whether the booking actually went through. */}
          {PACKAGES_ON_SALE
            ? "Book any package right here — we'll hold your first slot, and our team sets the package up and takes payment when you arrive. Message us on WhatsApp if you'd like to talk it through first."
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
            highlight={`RM${pricing.firstVisit}`}
            title="No need to decide today"
            description={
              pauseFirstVisit
                ? "Come once, see how it feels, and think about a routine afterwards. The 11.11 voucher is RM11 a soak while it runs."
                : `Come once, see how it feels, and think about a routine afterwards. Your first visit is RM${pricing.firstVisit} — online or at the door — instead of the usual RM${pricing.normal}.`
            }
            terms={`${launchOfferNote} After the launch period a first visit is the usual RM${pricing.normal}.`}
          />
        </div>
      </section>

      <NextStep
        title="Questions about anything?"
        body="Prices, packages, what to expect on the day — ask us whatever you like. Message us, or give us a call if you'd rather talk."
        cta={pauseFirstVisit ? ctaLabels.reserve : ctaLabels.firstVisit}
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
