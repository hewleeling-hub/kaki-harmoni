import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/primitives";
import { ExperienceList } from "@/components/experiences/ExperienceList";
import { Lotti } from "@/components/ui/Lotti";
import {
  SparklesIcon,
  ArmchairIcon,
  WavesIcon,
  CoffeeIcon,
  CalendarIcon,
  MessageIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";
import { whatsappLink } from "@/config/business";

export const metadata: Metadata = {
  title: "Our Signature Experiences — Kaki Harmoni",
  description:
    "Four warm ways to unwind at Kaki Harmoni — Deep Calm, Gentle Comfort, Fresh Start and Light Legs. A cosy 15-minute leg soak, good coffee and a moment to slow down.",
};

const EXPECT = [
  { icon: ArmchairIcon, title: "Get Comfortable", text: "Sit back, settle in and choose your experience." },
  { icon: WavesIcon, title: "Soak & Relax", text: "Enjoy your warm 15-minute Kaki Harmoni soak." },
  { icon: CoffeeIcon, title: "Stay a Little Longer", text: "Enjoy coffee, conversation or simply take your time." },
];

export default function ExperiencesPage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="fade-up grid items-center gap-6 py-8 sm:py-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-teal">
            <SparklesIcon size={18} className="text-coral" />
            Signature Experiences
          </p>
          <h1 className="mt-3 text-[42px] leading-[0.98] text-olive-dark sm:text-[52px] lg:text-[60px]">
            Our Signature
            <br />
            Experiences
          </h1>
          <p className="mt-5 max-w-md text-[18px] leading-relaxed text-muted">
            Fifteen minutes of pure relaxation.
            <br className="hidden sm:block" /> You deserve it.
          </p>
          <div className="mt-7">
            <Button href="/#reserve" size="lg" icon={<CalendarIcon size={22} />}>
              Book Now
            </Button>
          </div>
        </div>

        {/* Decorative Lotti composition */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-sm">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "radial-gradient(circle at 55% 45%, rgba(221,230,214,0.9), rgba(234,220,197,0.5) 45%, transparent 72%)" }}
            />
            <Lotti size={360} priority alt="Lotti relaxing with her feet in a warm soak and a coffee" className="relative mx-auto h-auto w-full max-w-[340px]" />
            <SparklesIcon size={26} className="absolute right-2 top-3 text-coral/70" />
            <SparklesIcon size={18} className="absolute left-3 top-16 text-gold/70" />
          </div>
        </div>
      </section>

      {/* Experience cards + detail modal */}
      <ExperienceList />

      {/* Recommendation */}
      <section className="py-8">
        <div className="flex flex-col items-center gap-5 rounded-[24px] border border-line bg-sage-light/60 p-8 text-center sm:p-10">
          <Lotti size={120} alt="Lotti waving hello" className="h-auto w-28" />
          <div>
            <h2 className="text-[28px] text-olive-dark sm:text-[32px]">Not sure which one feels right today?</h2>
            <p className="mx-auto mt-2 max-w-md text-[17px] leading-relaxed text-muted">
              Tell Lotti how you&apos;re feeling and we&apos;ll help you choose.
            </p>
          </div>
          <Button
            href={whatsappLink("Hi Kaki Harmoni! Not sure which experience suits me — could you help me choose?")}
            icon={<MessageIcon size={20} />}
          >
            Help Me Choose
          </Button>
        </div>
      </section>

      {/* What to expect */}
      <section className="py-8">
        <h2 className="text-center text-[28px] text-olive-dark sm:text-[32px]">What to Expect</h2>
        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3 sm:gap-5">
          {EXPECT.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="rounded-[22px] border border-line bg-ivory p-6 text-center shadow-[var(--shadow-warm)]">
              <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-light text-teal">
                <Icon size={26} />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-coral text-xs font-bold text-white">
                  {i + 1}
                </span>
              </span>
              <h3 className="mt-4 text-[20px] text-olive-dark">{title}</h3>
              <p className="mt-1.5 text-[16px] leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-10">
        <div className="overflow-hidden rounded-[26px] bg-olive p-8 shadow-[var(--shadow-warm)] sm:p-10">
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-[30px] leading-tight text-ivory sm:text-[36px]">Ready for a little me-time?</h2>
              <p className="mt-3 text-[18px] leading-relaxed text-ivory/85">
                15 minutes. A warm soak. Maybe a coffee.
              </p>
              <div className="mt-6">
                <Button
                  href="/#reserve"
                  className="!bg-ivory !text-olive-dark hover:!bg-cream"
                  size="lg"
                  iconRight={<ArrowRightIcon size={22} />}
                >
                  Book Your Experience
                </Button>
              </div>
            </div>
            <div className="hidden justify-self-end sm:block">
              <Lotti size={168} alt="Lotti waving" className="h-auto w-40" />
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
