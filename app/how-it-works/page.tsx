import type { Metadata } from "next";
import Image from "next/image";
import { PublicShell } from "@/components/layout/PublicShell";
import { Card, Button } from "@/components/ui/primitives";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { Lotti } from "@/components/ui/Lotti";
import { VisitJourney } from "@/components/visit/VisitJourney";
import {
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  SparklesIcon,
  UsersIcon,
  UserIcon,
  RepeatIcon,
} from "@/components/ui/icons";
import { faqs, goodToKnow, businessConfig, launchOffer } from "@/config/business";

export const metadata: Metadata = {
  title: "Your Visit — Kaki Harmoni",
  description:
    "What a visit to Kaki Harmoni is actually like — book a time, settle in, enjoy a warm 15-minute foot soak, then stay for a coffee. The same easy visit whether it's your first or your fiftieth.",
};

/** Understated strip — small icons, short text. Not four big cards. */
const QUICK_FACTS = [
  { icon: ClockIcon, text: "15-minute foot soak" },
  { icon: SparklesIcon, text: "Clean & comfortable space" },
  { icon: UsersIcon, text: "Walk-ins welcome, subject to availability" },
  { icon: CheckIcon, text: "No membership required" },
] as const;

export default function YourVisitPage() {
  const promo = launchOffer.active;

  return (
    <PublicShell>
      {/* ── 1. Hero — the experience, not the booking form ───────────────── */}
      <section className="fade-up grid items-center gap-8 py-6 sm:py-8 lg:grid-cols-2 lg:gap-12 lg:py-10">
        <div className="order-2 lg:order-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-olive">Your visit</p>
          <h1 className="mt-3 text-[36px] leading-[1.06] text-olive-dark sm:text-[46px] lg:text-[54px]">
            Your Kaki Harmoni
            <br />
            {/* DM Serif Display carries a true italic and is already loaded —
                the elegant treatment needs no extra typeface. */}
            <span className="italic text-olive">Journey</span>
          </h1>
          <p className="mt-5 max-w-md text-[18px] leading-relaxed text-muted">
            Whether it&rsquo;s your first soak or your regular reset, it&rsquo;s simple.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Lotti size={72} alt="Lotti waving hello" className="h-auto w-[62px] shrink-0" />
            <p className="text-[16px] leading-relaxed text-brown">
              Fifteen minutes, a warm soak and a good coffee.
              <br className="hidden sm:block" /> That&rsquo;s the whole thing.
            </p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <figure className="overflow-hidden rounded-[28px] border border-line shadow-[var(--shadow-warm-lg)]">
            <Image
              src="/shop/spa.png"
              alt="The Kaki Harmoni soaking room — warm foot soaks, comfortable chairs and soft lighting"
              width={1456}
              height={1092}
              priority
              className="h-auto w-full object-cover"
            />
          </figure>
        </div>
      </section>

      {/* ── 2 + 3. Visitor toggle and the five stages (interactive) ──────── */}
      <VisitJourney />

      {/* ── 4. Two ways to book, equally weighted ────────────────────────── */}
      <section className="py-10">
        <div className="grid gap-5 sm:grid-cols-2">
          <Card className="flex flex-col gap-3 bg-ivory">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-light text-olive">
              <UserIcon size={24} />
            </span>
            <h2 className="text-[23px] text-olive-dark">New to Kaki Harmoni?</h2>
            <p className="text-[16px] leading-relaxed text-muted">
              Your first step to feeling lighter and refreshed.
            </p>
            <div className="mt-auto pt-3">
              <Button href="/#reserve" full size="lg" icon={<CalendarIcon size={20} />}>
                {promo
                  ? `Book your first soak — RM${businessConfig.pricing.prepay}`
                  : "Book your first soak"}
              </Button>
            </div>
          </Card>

          {/* Same card, same weight, same size button — a regular is not a
              lesser customer, and the layout shouldn't imply otherwise. */}
          <Card className="flex flex-col gap-3 bg-ivory">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-light text-teal">
              <RepeatIcon size={24} />
            </span>
            <h2 className="text-[23px] text-olive-dark">Already a Kaki Harmoni regular?</h2>
            <p className="text-[16px] leading-relaxed text-muted">
              Welcome back! Book your next soak and continue your reset.
            </p>
            <div className="mt-auto pt-3">
              <Button href="/#reserve" full size="lg" icon={<CalendarIcon size={20} />}>
                Book your next soak
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 5. Quick facts ──────────────────────────────────────────────── */}
      <section className="py-4">
        <ul className="flex flex-col gap-3 rounded-[20px] border border-line bg-cream/50 px-6 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-5">
          {QUICK_FACTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 text-[15px] text-brown">
              <Icon size={18} className="shrink-0 text-olive" />
              {text}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Practical detail, kept below the experience ──────────────────── */}
      <section className="mt-10">
        <h2 className="text-[26px] text-olive-dark">Good to know before you visit</h2>
        <Card className="mt-5 bg-cream/60">
          <ul className="grid gap-3 sm:grid-cols-2">
            {goodToKnow.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[16px] text-brown">
                <CheckIcon size={20} className="mt-0.5 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="mt-12">
        <h2 className="text-[26px] text-olive-dark">Frequently asked questions</h2>
        <div className="mt-5">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* ── 6. A welcome, not another pitch ──────────────────────────────── */}
      <section className="py-12">
        <div className="flex flex-col items-center gap-4 rounded-[26px] border border-line bg-sage-light/60 p-8 text-center sm:p-10">
          <Lotti size={128} alt="Lotti waving hello" className="h-auto w-28" />
          <h2 className="text-[28px] text-olive-dark sm:text-[32px]">We look forward to seeing you!</h2>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-olive">
            Relax. Refresh. Reconnect.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
