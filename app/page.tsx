import Image from "next/image";
import SignupForm from "./signup-form";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button, Card, SectionHeading } from "@/components/ui/primitives";
import { StepCard, PromotionCard } from "@/components/ui/cards";
import { Lotti } from "@/components/ui/Lotti";
import { ExperienceList } from "@/components/experiences/ExperienceList";
import { CustomBlendNote } from "@/components/experiences/CustomBlendNote";
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
import { businessConfig, visitSteps, whatsappLink } from "@/config/business";

const STEP_ICONS = { calendar: CalendarIcon, gift: CoffeeIcon, message: MessageIcon, heart: HeartIcon } as const;
const BENEFITS = [
  { icon: ClockIcon, title: "15-Minute Soak", text: "A simple break that fits into your day." },
  { icon: HeartIcon, title: "Comfortable & Gentle", text: "Sit back and enjoy a warm, relaxing soak." },
  { icon: CoffeeIcon, title: "Coffee & Conversation", text: "Relax alone or reconnect with someone you care about." },
];

export default function Home() {
  const { pricing, bookingStartLabel } = businessConfig;

  return (
    <PublicShell>
      {/* Hero */}
      <section className="fade-up grid items-center gap-8 py-8 sm:py-10 lg:grid-cols-2 lg:gap-12 lg:py-14">
        <div className="order-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-olive">
            {businessConfig.tagline}
          </p>
          <h1 className="mt-3 text-[34px] leading-[1.1] text-olive-dark sm:text-[44px] lg:text-[50px]">
            Slow down.
            <br />
            Soak. Smile.
            <br />
            <span className="text-olive">Reconnect.</span>
          </h1>
          <p className="mt-5 max-w-md text-[18px] leading-relaxed text-muted">
            A cosy space for a warm leg soak, good coffee and great company. Reserve
            your first visit now to lock the launch price.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="#reserve" size="lg" icon={<CalendarIcon size={22} />}>
              Reserve your spot
            </Button>
            <Button href="/location" variant="secondary" size="lg" icon={<MapPinIcon size={22} />}>
              Find Us
            </Button>
          </div>
        </div>

        <div className="order-2 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="rounded-[28px] bg-[radial-gradient(circle_at_60%_35%,#EFD6BD_0%,#F7F0E3_70%)] p-6 shadow-[var(--shadow-warm)]">
              <Lotti size={320} priority className="mx-auto h-auto w-full max-w-[320px]" />
            </div>
            <div className="absolute -bottom-3 left-2 max-w-[220px] rotate-[-3deg] rounded-[18px] rounded-bl-sm border border-line bg-ivory px-4 py-2 shadow-[var(--shadow-warm)] sm:left-6">
              <p className="text-[16px] italic leading-snug text-brown" style={{ fontFamily: "var(--font-heading)" }}>
                Hi, I&apos;m Lotti! Let&apos;s relax together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit strip */}
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

      {/* Signature experiences */}
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

      {/* Reserve (keeps the real signup + prepay flow) */}
      <section id="reserve" className="scroll-mt-24 py-10">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionHeading eyebrow="Reserve your first visit" title="Lock the launch price today" />
            <p className="mt-4 text-[18px] leading-relaxed text-muted">
              Your first visit is{" "}
              <strong className="text-olive-dark">RM{pricing.prepay} when you prepay</strong> online
              (or RM{pricing.walkin} at the door), instead of the usual RM{pricing.normal}. Reserve,
              prepay and pick your visit time — first visits from {bookingStartLabel}.
            </p>
            <ul className="mt-5 space-y-2 text-[16px] text-brown">
              {["No account needed", "Pay online or at the door", "Pick your visit time after prepaying"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-olive" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <Card className="bg-ivory">
            <SignupForm />
          </Card>
        </div>
      </section>

      {/* How it works preview */}
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

      {/* Prices preview */}
      <section className="py-10">
        <SectionHeading center eyebrow="Prices" title="One simple launch offer" />
        <div className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
          <Card className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-olive">Prepay online</p>
            <p className="mt-2 text-4xl font-bold text-olive" style={{ fontFamily: "var(--font-heading)" }}>
              RM{pricing.prepay}
            </p>
            <p className="mt-2 text-[16px] text-muted">Lock the launch price for your first visit.</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brown">Pay at the door</p>
            <p className="mt-2 text-4xl font-bold text-brown" style={{ fontFamily: "var(--font-heading)" }}>
              RM{pricing.walkin}
            </p>
            <p className="mt-2 text-[16px] text-muted">Reserve now, settle when you arrive.</p>
          </Card>
        </div>
        <div className="mx-auto mt-5 max-w-3xl">
          <PromotionCard
            highlight={`Save RM${pricing.normal - pricing.prepay}`}
            title="Launch price for first visits"
            description={`First visit is RM${pricing.prepay} prepaid, instead of the usual RM${pricing.normal}. A warm leg soak, with a coffee to enjoy before or after.`}
            terms="Launch offer for a first visit. Prepay online to lock the price."
          />
        </div>
        <div className="mt-8 flex justify-center">
          <Button href="/prices" variant="secondary" iconRight={<ArrowRightIcon size={20} />}>
            View Prices
          </Button>
        </div>
      </section>

      {/* Community */}
      <section className="grid items-center gap-8 py-10 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <div className="overflow-hidden rounded-[24px] border border-line shadow-[var(--shadow-warm)]">
            <Image
              src="/kaki-welcome.png"
              alt="A warm welcome at Kaki Harmoni"
              width={720}
              height={540}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <SectionHeading eyebrow="More than a soak" title="A comfortable place to slow down" />
          <p className="mt-4 text-[18px] leading-relaxed text-muted">
            Kaki Harmoni is a comfortable place to slow down, bring your parents, meet a friend or
            simply enjoy a quiet moment.
          </p>
          <ul className="mt-5 space-y-2 text-[16px] text-brown">
            {["Freshly brewed coffee & tea", "Comfortable chairs to sink into", "A friendly space to chat", "Warm, welcoming and unhurried"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <UsersIcon size={18} className="text-olive" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-10">
        <div className="rounded-[24px] border border-line bg-beige p-8 shadow-[var(--shadow-warm)] sm:p-10">
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-[28px] text-olive-dark sm:text-[32px]">Ready for a little break?</h2>
              <p className="mt-3 max-w-lg text-[18px] leading-relaxed text-brown">
                Reserve your visit and take 15 minutes to relax, refresh and reconnect.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="#reserve" size="lg" icon={<CalendarIcon size={22} />}>
                  Reserve your spot
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
