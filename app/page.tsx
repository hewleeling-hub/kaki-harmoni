import Image from "next/image";
import SignupForm from "./signup-form";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button, Card, SectionHeading } from "@/components/ui/primitives";
import { PromotionCard } from "@/components/ui/cards";
import { Lotti } from "@/components/ui/Lotti";
import { ExperienceList } from "@/components/experiences/ExperienceList";
import { CustomBlendNote } from "@/components/experiences/CustomBlendNote";
import {
  RoutineLadder,
  PackagePicker,
  WhyNotAtHome,
  Testimonials,
  ExperienceVideo,
} from "@/components/ui/conversion";
import {
  CalendarIcon,
  MapPinIcon,
  MessageIcon,
  ClockIcon,
  HeartIcon,
  CoffeeIcon,
  ArrowRightIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { businessConfig, visitSteps, whatsappLink, proposition, ctaLabels } from "@/config/business";

const STEP_ICONS = { calendar: CalendarIcon, gift: CoffeeIcon, message: MessageIcon, heart: HeartIcon } as const;
const BENEFITS = [
  { icon: ClockIcon, title: "15-Minute Soak", text: "Short enough to fit into any day." },
  { icon: HeartIcon, title: "Comfortable & Gentle", text: "Sit back and enjoy a warm, relaxing soak." },
  { icon: CoffeeIcon, title: "Coffee & Conversation", text: "Relax alone or reconnect with someone you care about." },
];

/* "Only 15 minutes? That's the point." — turns the duration into the reason
 * it's possible to do this every day. */
const FIFTEEN_MINUTES = [
  "No long appointments.",
  "No complicated treatments.",
  "No need to block out half your day.",
];

export default function Home() {
  const { pricing, bookingStartLabel } = businessConfig;

  return (
    <PublicShell>
      {/* ── Hero — the proposition, in a few seconds ───────────────────── */}
      <section className="fade-up grid items-center gap-8 py-8 sm:py-10 lg:grid-cols-2 lg:gap-12 lg:py-14">
        <div className="order-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-olive">
            {businessConfig.tagline}
          </p>
          <h1 className="mt-3 text-[34px] leading-[1.1] text-olive-dark sm:text-[44px] lg:text-[50px]">
            Your 15-minute
            <br />
            <span className="text-olive">daily reset.</span>
          </h1>
          <p className="mt-5 max-w-md text-[18px] leading-relaxed text-muted">
            A warm leg soak, a good coffee and a comfortable place to sit — all in
            fifteen minutes. Easy enough to fit into your day, every day.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="#reserve" size="lg" icon={<CalendarIcon size={22} />}>
              {ctaLabels.firstVisit}
            </Button>
            <Button href="#routine" variant="secondary" size="lg">
              {ctaLabels.packages}
            </Button>
          </div>
          <p className="mt-4 text-[15px] text-muted">
            First visits from {bookingStartLabel}. RM{pricing.prepay} when you prepay, instead of
            the usual RM{pricing.normal}.
          </p>
        </div>

        <div className="order-2 flex justify-center">
          <div className="relative w-full max-w-md">
            <figure className="overflow-hidden rounded-[28px] border border-line shadow-[var(--shadow-warm)]">
              <Image
                src="/shop/shop1.png"
                alt="Inside Kaki Harmoni — the welcoming café and reception, with the marble table, plants and 'Relax, Refresh, Reconnect' sign"
                width={1456}
                height={1092}
                priority
                className="h-[360px] w-full object-cover object-center sm:h-[440px]"
              />
            </figure>
            <div className="absolute -bottom-5 left-2 flex max-w-[320px] items-center gap-3 rotate-[-3deg] rounded-[22px] rounded-bl-sm border border-line bg-ivory px-5 py-3.5 shadow-[var(--shadow-warm)] sm:left-6">
              <Lotti size={60} className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" />
              <p className="text-[19px] italic leading-snug text-brown sm:text-[21px]" style={{ fontFamily: "var(--font-heading)" }}>
                Soak, sip &amp; unwind with us!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefit strip ──────────────────────────────────────────────── */}
      <section className="grid gap-4 py-6 sm:grid-cols-3 sm:gap-5">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <Card key={title} className="bg-cream/60 text-center sm:text-left">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-olive/12 text-olive">
              <Icon size={26} />
            </span>
            <h3 className="mt-4 text-[18px] text-olive-dark">{title}</h3>
            <p className="mt-1.5 text-[16px] leading-relaxed text-muted">{text}</p>
          </Card>
        ))}
      </section>

      {/* ── The habit — the commercial heart of the proposition ────────── */}
      <section className="py-10">
        <div className="rounded-[24px] border border-line bg-sage/25 p-8 shadow-[var(--shadow-warm)] sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-olive">
              {proposition}
            </p>
            <h2 className="text-[26px] leading-tight text-olive-dark sm:text-[32px]">
              The magic is in making it a habit.
            </h2>
            <p className="mt-5 text-[18px] leading-relaxed text-brown">
              Kaki Harmoni isn&rsquo;t meant to be something you only do once in a while.
            </p>
            <p className="mt-3 text-[18px] leading-relaxed text-brown">
              Just 15 minutes can become your little pause in a busy day.
            </p>
            <p className="mt-3 text-[18px] leading-relaxed text-brown">
              For the best experience we recommend regular visits — ideally daily — so your
              Kaki Harmoni soak becomes part of your routine.
            </p>
          </div>
        </div>
      </section>

      {/* ── Fifteen minutes as the advantage, not the catch ────────────── */}
      <section className="py-10">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionHeading eyebrow="Why it works" title="Only 15 minutes? That's the point." />
            <p className="mt-4 text-[18px] leading-relaxed text-muted">
              Kaki Harmoni is built to be easy to fit into everyday life.
            </p>
            <ul className="mt-5 space-y-3">
              {FIFTEEN_MINUTES.map((line) => (
                <li key={line} className="flex items-start gap-3 text-[17px] text-brown">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[18px] leading-relaxed text-brown">
              Just 15 minutes to sit down, soak, relax and reset — then get on with your day.
            </p>
          </div>
          <Card className="bg-cream/60">
            <p className="text-[19px] leading-relaxed text-brown">
              The best part of Kaki Harmoni isn&rsquo;t only the 15 minutes you spend here.
              It&rsquo;s making those 15 minutes yours.
            </p>
            <ul className="mt-5 space-y-2 text-[17px] text-olive-dark">
              <li>A quiet moment before work.</li>
              <li>A reset after a busy day.</li>
              <li>A little time with a friend.</li>
              <li>A simple daily ritual.</li>
            </ul>
            <p className="mt-5 text-[17px] leading-relaxed text-muted">
              That&rsquo;s why we encourage regular visits.
            </p>
          </Card>
        </div>
      </section>

      {/* ── Signature experiences ──────────────────────────────────────── */}
      <section className="py-10">
        <SectionHeading
          center
          eyebrow="Signature Experiences"
          title="Find your soak"
          subtitle="Four warm ways to unwind — pick the mood that suits your day."
        />
        <div className="mt-8">
          <ExperienceList />
        </div>
        <CustomBlendNote />
        <div className="mt-4 flex justify-center">
          <Button href="/experiences" variant="secondary" iconRight={<ArrowRightIcon size={20} />}>
            Explore Experiences
          </Button>
        </div>
      </section>

      {/* ── Why here rather than a bucket at home ──────────────────────── */}
      <section className="py-10">
        <SectionHeading
          center
          eyebrow="More than warm water"
          title="Why Kaki Harmoni instead of doing it at home?"
          subtitle="It's the whole fifteen minutes — the water, the warmth, the coffee and the company."
        />
        <WhyNotAtHome className="mx-auto mt-8 max-w-4xl" />
      </section>

      {/* Real footage and genuine guest reviews. Both render nothing until
          the business has them — never stock video or invented quotes. */}
      <ExperienceVideo />
      <Testimonials />

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="py-10">
        <SectionHeading center eyebrow="Your relaxing visit" title="How it works, in four easy steps" />
        <ol className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visitSteps.map((step) => {
            const Icon = STEP_ICONS[step.icon as keyof typeof STEP_ICONS] ?? UsersIcon;
            return (
              <li key={step.number} className="rounded-[22px] border border-line bg-ivory p-5 text-center shadow-[var(--shadow-warm)]">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/50 text-olive-dark">
                  <Icon size={26} />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-olive text-xs font-bold text-ivory">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-3 text-[18px] text-olive-dark">{step.title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{step.short}</p>
              </li>
            );
          })}
        </ol>
        <div className="mt-8 flex justify-center">
          <Button href="/how-it-works" variant="secondary" iconRight={<ArrowRightIcon size={20} />}>
            See How It Works
          </Button>
        </div>
      </section>

      {/* ── Try it — the dominant acquisition step ─────────────────────── */}
      <section id="reserve" className="scroll-mt-24 py-10">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionHeading eyebrow="Start here" title={`Try your first soak — RM${pricing.prepay}`} />
            <p className="mt-4 text-[18px] leading-relaxed text-muted">
              An easy way to find out whether fifteen minutes suits you. Your first visit is{" "}
              <strong className="text-olive-dark">RM{pricing.prepay} when you prepay</strong> online
              (or RM{pricing.walkin} at the door), instead of the usual RM{pricing.normal}. Reserve,
              prepay and pick your time — first visits from {bookingStartLabel}.
            </p>
            <ul className="mt-5 space-y-2 text-[16px] text-brown">
              {["No account needed", "Pay online or at the door", "Pick your visit time after prepaying"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-olive" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[16px] leading-relaxed text-muted">
              Enjoyed it? Then it&rsquo;s worth looking at how to make it a routine — no rush,
              and no need to decide today.
            </p>
          </div>
          <Card className="bg-ivory">
            <SignupForm />
          </Card>
        </div>
      </section>

      {/* ── Then make it a routine ─────────────────────────────────────── */}
      <section id="routine" className="scroll-mt-24 py-10">
        <SectionHeading
          center
          eyebrow="Try → Reset → Routine → Ritual"
          title="Make it part of your day"
          subtitle="Packages aren't really about the discount — they're the easiest way to turn fifteen minutes into a habit."
        />
        <RoutineLadder className="mt-8" />

        <div className="mx-auto mt-10 max-w-3xl">
          <SectionHeading center title="Which one is right for me?" />
          <PackagePicker className="mt-6" />
        </div>

        <div className="mx-auto mt-8 max-w-3xl">
          <PromotionCard
            highlight={`RM${pricing.prepay}`}
            title="Start with a single soak"
            description={`There's no need to commit to anything today. Come once for RM${pricing.prepay}, see how it feels, and decide about a routine afterwards.`}
            terms={`First-visit launch offer, prepaid online. First visits from ${bookingStartLabel}.`}
          />
        </div>
      </section>

      {/* ── Inside the shop ────────────────────────────────────────────── */}
      <section className="py-10">
        <SectionHeading
          center
          eyebrow="More than a soak"
          title="A comfortable place to slow down"
          subtitle="Bring your parents, meet a friend or simply enjoy a quiet moment — coffee, comfy chairs and a warm, unhurried space."
        />
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 lg:h-[440px] lg:grid-cols-3 lg:grid-rows-2">
          <figure className="col-span-2 overflow-hidden rounded-[22px] border border-line shadow-[var(--shadow-warm)] lg:row-span-2">
            <Image
              src="/shop/cafe.png"
              alt="Inside the Kaki Harmoni café — tables, plants and warm lighting"
              width={1000}
              height={750}
              className="h-56 w-full object-cover sm:h-72 lg:h-full"
            />
          </figure>
          <figure className="overflow-hidden rounded-[22px] border border-line shadow-[var(--shadow-warm)]">
            <Image
              src="/shop/spa.png"
              alt="The Kaki Harmoni soaking room, with comfy chairs and plants"
              width={700}
              height={525}
              className="h-40 w-full object-cover sm:h-44 lg:h-full"
            />
          </figure>
          <figure className="overflow-hidden rounded-[22px] border border-line shadow-[var(--shadow-warm)]">
            <Image
              src="/shop/entrance.png"
              alt="The Kaki Harmoni entrance, with Lotti waving hello on the glass door"
              width={1092}
              height={1456}
              className="h-40 w-full object-cover object-top sm:h-44 lg:h-full"
            />
          </figure>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-[17px] leading-relaxed text-brown">
          You&rsquo;ll find us inside the Desa Cindaimas clubhouse, with free parking on site.{" "}
          <strong className="text-olive-dark">Not a resident? You&rsquo;re welcome too</strong> —
          visitors and walk-ins are always welcome.
        </p>
        <div className="mt-6 flex justify-center">
          <Button href="/location" variant="secondary" icon={<MapPinIcon size={20} />}>
            Find Us
          </Button>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="py-10">
        <div className="rounded-[24px] border border-line bg-beige p-8 shadow-[var(--shadow-warm)] sm:p-10">
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-[28px] text-olive-dark sm:text-[32px]">Ready for your first fifteen minutes?</h2>
              <p className="mt-3 max-w-lg text-[18px] leading-relaxed text-brown">
                Come once, see how it feels, and go from there.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="#reserve" size="lg" icon={<CalendarIcon size={22} />}>
                  {ctaLabels.firstVisit}
                </Button>
                <Button
                  href={whatsappLink("Hi Kaki Harmoni! I'd like to ask about a visit.")}
                  variant="secondary"
                  size="lg"
                  icon={<MessageIcon size={22} />}
                >
                  WhatsApp Us
                </Button>
              </div>
            </div>
            <div className="hidden justify-self-end sm:block">
              <Lotti size={160} className="h-auto w-40" />
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
