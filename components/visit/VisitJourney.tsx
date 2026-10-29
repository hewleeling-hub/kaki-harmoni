"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/primitives";
import { CalendarIcon, CheckIcon } from "@/components/ui/icons";
import { soakOfferPrice } from "@/config/promotions";
import { businessConfig, launchOffer, SHOW_RETURNING_VISITOR } from "@/config/business";

type Visitor = "first" | "returning";


/**
 * The five stages of a visit: choose a time, choose how to pay, arrive, soak,
 * stay. Payment sits at 02 because that is genuinely where it happens — the
 * slot is picked first and paying is what confirms it — and the customer needs
 * to know both options exist before they start.
 */
const STAGES = [
  {
    n: "01",
    title: "Book your time",
    lead: "Choose your preferred day and time.",
    text: "Select a convenient date and available time slot for your visit.",
    photo: null,
    alt: "",
  },
  {
    n: "02",
    title: "Confirm your booking",
    lead: "Choose how you'd like to pay.",
    text: "Pay online now or at the door when you arrive — same price, both are proper bookings.",
    photo: null,
    alt: "",
  },
  {
    n: "03",
    title: "Arrive & settle in",
    lead: "Come in, take a seat and let us get you comfortable.",
    text: "No complicated preparation. Just arrive and relax.",
    photo: "/shop/shop1.png",
    alt: "The Kaki Harmoni reception and café, with a Welcome sign and comfortable seating",
  },
  {
    n: "04",
    title: "Soak & unwind",
    lead: "Enjoy your 15-minute foot hydrotherapy experience.",
    text: "Choose your preferred experience and let the machine do the work.",
    photo: "/shop/spa.png",
    alt: "The Kaki Harmoni soaking room — four warm foot soaks with comfortable chairs",
  },
  {
    n: "05",
    title: "Stay & reconnect",
    lead: "Your soak doesn't have to be the end of your visit.",
    text: "Enjoy a coffee, a snack or a friendly chat with us.",
    photo: "/shop/cafe.png",
    alt: "The Kaki Harmoni café area, with tables, plants and the signature experience posters",
  },
] as const;

/** Only stage 01 changes with who you are. */
const STAGE_ONE_NOTE: Record<Visitor, string> = {
  first: "First visit? Enjoy our special opening rate.",
  returning: "Already been here? Simply book your next soak.",
};

function StageMedia({ stage }: { stage: (typeof STAGES)[number] }) {
  if (stage.photo) {
    return (
      <Image
        src={stage.photo}
        alt={stage.alt}
        fill
        sizes="(min-width: 1024px) 176px, 140px"
        className="object-cover"
      />
    );
  }
  // Booking and confirming have no photograph, so they take the brand's own
  // marks rather than a stock image that doesn't match the room.
  const Icon = stage.n === "01" ? CalendarIcon : CheckIcon;
  return (
    <span className="flex h-full w-full items-center justify-center bg-sage-light text-olive">
      <Icon size={44} />
    </span>
  );
}

/**
 * The two ways to pay, shown as information under stage 02 — not buttons.
 * The real choice is made in checkout; a second set of live-looking buttons
 * here would be a dead control.
 */
function PaymentOptions() {
  const { firstVisit } = businessConfig.pricing;
  const offer = soakOfferPrice();
  return (
    <div className="mt-1 w-full rounded-[16px] border-2 border-olive bg-ivory px-4 py-3.5 sm:max-w-md lg:max-w-none">
      <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-olive">First visit</p>
      <p
        className="mt-0.5 text-[26px] font-bold leading-none text-olive"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {offer ? (
          <>
            <span className="text-[19px] text-muted line-through">RM{firstVisit}</span>{" "}
            <span className="text-[#7a5410]">{offer}</span>
          </>
        ) : (
          <>RM{firstVisit}</>
        )}
      </p>
      <p className="mt-2 text-[13.5px] leading-snug text-muted">
        {offer
          ? "With an 11.11 voucher — buy by 11 Nov, 2 per person, redeem by 31 Dec."
          : "Pay online now, or at the door when you arrive — the price is the same either way."}
      </p>
    </div>
  );
}

export function VisitJourney() {
  const offerPrice = soakOfferPrice();
  const [who, setWho] = useState<Visitor>("first");
  const panelId = useId();
  const isFirst = who === "first";
  const promo = launchOffer.active;
  const { firstVisit } = businessConfig.pricing;

  const tab =
    "min-h-12 flex-1 rounded-full px-5 py-3 text-[15px] font-semibold transition duration-200 ease-out sm:flex-none sm:px-7";

  return (
    <>
      {/* ── Who are you? ────────────────────────────────────────────────── */}
      <section className="py-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          {SHOW_RETURNING_VISITOR && (
            <>
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
            </>
          )}

          {/* One panel, swapped content. `key` restarts the fade so the change
              is felt without anything moving on the page.

              The tab semantics are attached only when the toggle is on. A
              tabpanel whose aria-labelledby points at a button that isn't in
              the document is broken ARIA, and a screen reader announcing "tab
              panel" with no tabs to move between is worse than a plain
              region. */}
          <div
            {...(SHOW_RETURNING_VISITOR
              ? {
                  id: panelId,
                  role: "tabpanel" as const,
                  "aria-labelledby": `${panelId}-tab-${isFirst ? "first" : "returning"}`,
                }
              : {})}
            key={who}
            className="fade-up w-full rounded-[24px] border border-line bg-ivory p-7 shadow-[var(--shadow-warm)] sm:p-9"
          >
            {isFirst ? (
              <>
                <h2 className="text-[26px] text-olive-dark sm:text-[30px]">First time at Kaki Harmoni?</h2>
                <p className="mt-2 text-[17px] text-brown">
                  {promo
                    ? "Start your Kaki Harmoni experience with our special launch offer."
                    : "Start your Kaki Harmoni experience with a warm 15-minute soak."}
                </p>
                {promo && (
                  <div className="mt-5 flex flex-col items-center gap-1">
                    <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-olive">
                      First soak
                    </p>
                    <p
                      className="text-[34px] font-bold leading-none text-olive sm:text-[40px]"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {offerPrice ? (
                        <>
                          <span className="text-[24px] text-muted line-through sm:text-[28px]">
                            RM{firstVisit}
                          </span>{" "}
                          <span className="text-[#7a5410]">{offerPrice}</span>
                        </>
                      ) : (
                        <>RM{firstVisit}</>
                      )}
                    </p>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">
                      {offerPrice
                        ? "With an 11.11 voucher — buy by 11 Nov, 2 per person, redeem by 31 Dec."
                        : "Pay online or at the door — the price is the same either way."}
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

      {/* ── The journey ─────────────────────────────────────────────────── */}
      <section className="py-10">
        <h2 className="text-center text-[28px] text-olive-dark sm:text-[34px]">
          Here&rsquo;s how your visit works
        </h2>

        {/* Desktop: one dashed line running behind the row of circles.
            aria-hidden — decoration; the order lives in the markup. */}
        <div className="relative mt-10">
          <div
            aria-hidden
            className="absolute left-[10%] right-[10%] top-[88px] hidden border-t-2 border-dashed border-line lg:block"
          />

          <ol className="relative grid gap-0 lg:grid-cols-5 lg:gap-4">
            {STAGES.map((stage, i) => (
              <li key={stage.n} className="contents lg:block">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="relative h-[140px] w-[140px] shrink-0 overflow-hidden rounded-full border-4 border-ivory shadow-[var(--shadow-warm)] lg:h-[176px] lg:w-[176px]">
                    <StageMedia stage={stage} />
                  </div>

                  <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#7a5410]">
                    {stage.n}
                  </span>
                  <h3 className="-mt-2 text-[20px] leading-tight text-olive-dark">{stage.title}</h3>
                  <p className="-mt-1 max-w-[32ch] text-[15.5px] font-medium leading-snug text-brown">
                    {stage.lead}
                  </p>
                  <p className="-mt-1 max-w-[32ch] text-[14.5px] leading-relaxed text-muted">
                    {stage.text}
                  </p>

                  {stage.n === "01" && (
                    <p
                      key={who}
                      className="fade-up max-w-[32ch] rounded-[16px] bg-sage/30 px-4 py-2.5 text-[14px] font-medium text-olive-dark"
                    >
                      {STAGE_ONE_NOTE[who]}
                    </p>
                  )}

                  {stage.n === "02" && <PaymentOptions />}

                  {stage.n === "05" && (
                    <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-olive">
                      Relax. Refresh. Reconnect.
                    </p>
                  )}
                </div>

                {/* Mobile connector — a short dashed drop with an arrowhead. */}
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
