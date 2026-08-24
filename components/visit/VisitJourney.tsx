"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/primitives";
import { Lotti } from "@/components/ui/Lotti";
import { CalendarIcon } from "@/components/ui/icons";
import { businessConfig, launchOffer, launchOfferBadge } from "@/config/business";

type Visitor = "first" | "returning";

/**
 * The five stages of a visit. Deliberately NOT the booking funnel: paying is
 * not a stage, because a stage should be something you experience. Stage 01
 * carries a line that changes with the toggle; the rest are the same visit for
 * everybody, which is the point the page is making.
 */
const STAGES = [
  {
    n: "01",
    title: "Book your time",
    text: "Choose your preferred day and time online.",
    photo: null,
    alt: "",
  },
  {
    n: "02",
    title: "Arrive & settle in",
    text: "Come in, take a seat and let us take care of you. No complicated preparation — just arrive and relax.",
    photo: "/shop/shop1.png",
    alt: "The Kaki Harmoni reception and café, with a Welcome sign and comfortable seating",
  },
  {
    n: "03",
    title: "Soak & unwind",
    text: "Enjoy your 15-minute foot hydrotherapy experience. Pick the soak that suits your day and let the machine do the work.",
    photo: "/shop/spa.png",
    alt: "The Kaki Harmoni soaking room — four warm foot soaks with comfortable chairs",
  },
  {
    n: "04",
    title: "Stay awhile",
    text: "Your soak doesn't have to be the end of your visit. Enjoy a coffee, a snack, or a friendly chat with us.",
    photo: "/shop/cafe.png",
    alt: "The Kaki Harmoni café area, with tables, plants and the signature experience posters",
  },
  {
    n: "05",
    title: "Reconnect",
    text: "Feel lighter, refreshed and recharged. Come back whenever you need a little time for yourself.",
    photo: null,
    alt: "",
  },
] as const;

/** Only stage 01 changes with who you are. */
const STAGE_ONE_NOTE: Record<Visitor, string> = {
  first: `First visit? Enjoy our special RM${businessConfig.pricing.prepay} launch offer.`,
  returning: "Returning? Simply choose your preferred time for your next soak.",
};

function StageMedia({ stage }: { stage: (typeof STAGES)[number] }) {
  if (stage.photo) {
    return (
      <Image
        src={stage.photo}
        alt={stage.alt}
        fill
        sizes="(min-width: 1024px) 190px, 148px"
        className="object-cover"
      />
    );
  }
  // No photograph exists for booking or for the feeling you leave with, so
  // these two use the brand's own marks rather than a mismatched stock photo.
  return stage.n === "01" ? (
    <span className="flex h-full w-full items-center justify-center bg-sage-light text-olive">
      <CalendarIcon size={46} />
    </span>
  ) : (
    <span className="flex h-full w-full items-center justify-center bg-sage-light p-3">
      <Lotti size={150} alt="Lotti, relaxed after her soak" className="h-auto w-full" />
    </span>
  );
}

export function VisitJourney() {
  const [who, setWho] = useState<Visitor>("first");
  const panelId = useId();
  const isFirst = who === "first";
  const promo = launchOffer.active;

  const tab =
    "min-h-12 flex-1 rounded-full px-5 py-3 text-[15px] font-semibold transition duration-200 ease-out sm:flex-none sm:px-7";

  return (
    <>
      {/* ── 2. Who are you? ─────────────────────────────────────────────── */}
      <section className="py-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-olive">I&rsquo;m a…</p>

          <div
            role="tablist"
            aria-label="Are you visiting for the first time?"
            className="flex w-full gap-2 rounded-full border border-line bg-beige/70 p-1.5 sm:w-auto"
          >
            <button
              type="button"
              role="tab"
              id={`${panelId}-tab-first`}
              aria-selected={isFirst}
              aria-controls={panelId}
              onClick={() => setWho("first")}
              className={`${tab} ${
                isFirst ? "bg-olive text-ivory shadow-[var(--shadow-warm)]" : "text-brown hover:bg-ivory/70"
              }`}
            >
              First-time visitor
            </button>
            <button
              type="button"
              role="tab"
              id={`${panelId}-tab-returning`}
              aria-selected={!isFirst}
              aria-controls={panelId}
              onClick={() => setWho("returning")}
              className={`${tab} ${
                !isFirst ? "bg-olive text-ivory shadow-[var(--shadow-warm)]" : "text-brown hover:bg-ivory/70"
              }`}
            >
              Returning visitor
            </button>
          </div>

          {/* One panel, swapped content. `key` restarts the fade so the change
              is felt without anything moving on the page. */}
          <div
            id={panelId}
            role="tabpanel"
            aria-labelledby={`${panelId}-tab-${isFirst ? "first" : "returning"}`}
            key={who}
            className="fade-up mt-2 w-full rounded-[24px] border border-line bg-ivory p-7 shadow-[var(--shadow-warm)] sm:p-9"
          >
            {isFirst ? (
              <>
                <h2 className="text-[26px] text-olive-dark sm:text-[30px]">First time at Kaki Harmoni?</h2>
                {promo && <p className="mt-2 text-[17px] text-brown">Enjoy our special launch offer.</p>}
                {promo && (
                  <div className="mt-5 flex flex-col items-center gap-1.5">
                    <p
                      className="text-[34px] font-bold leading-none text-olive sm:text-[40px]"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      First soak — RM{businessConfig.pricing.prepay}
                    </p>
                    <p className="text-[14px] font-semibold uppercase tracking-wide text-[#7a5410]">
                      {launchOfferBadge}
                    </p>
                  </div>
                )}
                <div className="mt-6">
                  <Button href="/#reserve" size="lg" icon={<CalendarIcon size={22} />}>
                    Book your first soak
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-[26px] text-olive-dark sm:text-[30px]">Welcome back!</h2>
                <p className="mt-2 text-[17px] text-brown">Ready for your next little reset?</p>
                <div className="mt-6">
                  <Button href="/#reserve" size="lg" icon={<CalendarIcon size={22} />}>
                    Book your next soak
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. The journey ──────────────────────────────────────────────── */}
      <section className="py-10">
        <h2 className="text-center text-[28px] text-olive-dark sm:text-[34px]">
          Here&rsquo;s how your visit works
        </h2>

        {/* Desktop: one dotted line running behind the row of circles.
            aria-hidden — it is pure decoration, the order is in the markup. */}
        <div className="relative mt-10">
          <div
            aria-hidden
            className="absolute left-[10%] right-[10%] top-[95px] hidden border-t-2 border-dashed border-line lg:block"
          />

          <ol className="relative grid gap-0 lg:grid-cols-5 lg:gap-5">
            {STAGES.map((stage, i) => (
              <li key={stage.n} className="contents lg:block">
                <div className="flex flex-col items-center gap-3 text-center lg:gap-4">
                  <div className="relative h-[148px] w-[148px] shrink-0 overflow-hidden rounded-full border-4 border-ivory shadow-[var(--shadow-warm)] lg:h-[190px] lg:w-[190px]">
                    <StageMedia stage={stage} />
                  </div>

                  <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#7a5410]">
                    {stage.n}
                  </span>
                  <h3 className="-mt-1.5 text-[21px] leading-tight text-olive-dark">{stage.title}</h3>
                  <p className="max-w-[34ch] text-[15.5px] leading-relaxed text-muted">{stage.text}</p>

                  {stage.n === "01" && (
                    <p
                      key={who}
                      className="fade-up max-w-[34ch] rounded-[16px] bg-sage/30 px-4 py-2.5 text-[14.5px] font-medium text-olive-dark"
                    >
                      {STAGE_ONE_NOTE[who]}
                    </p>
                  )}

                  {stage.n === "05" && (
                    <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-olive">
                      Relax. Refresh. Reconnect.
                    </p>
                  )}
                </div>

                {/* Mobile connector — a short dotted drop with an arrowhead. */}
                {i < STAGES.length - 1 && (
                  <div aria-hidden className="flex justify-center py-5 lg:hidden">
                    <span className="flex h-10 flex-col items-center">
                      <span className="h-7 border-l-2 border-dashed border-line" />
                      <svg width="16" height="10" viewBox="0 0 16 10" className="text-line" aria-hidden>
                        <path
                          d="M2 2l6 6 6-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
