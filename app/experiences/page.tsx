import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/primitives";
import { ExperienceList } from "@/components/experiences/ExperienceList";
import { CustomBlendNote } from "@/components/experiences/CustomBlendNote";
import {
  SparklesIcon,
  ArmchairIcon,
  WavesIcon,
  CoffeeIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";

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
      {/* Hero — one column. It was a two-column grid with artwork on the right;
          both the mascot and the photo of the room that replaced her are gone,
          because this page's job is the four blends and neither picture was
          about them. A grid with an empty second column would just squeeze the
          words into half the width. */}
      <section className="fade-up py-8 sm:py-10">
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
        {/* No "Book Now" here. The page's job above the fold is to get you
            looking at the four blends; the closing CTA asks for the booking
            once you've picked one. Asking at the top means asking before the
            reader knows what they'd be booking. */}
      </section>

      {/* Experience cards + detail modal */}
      <ExperienceList />

      {/* Custom blend + "not sure which one?" — one callout, not two boxes in
          a row asking the same question. Lives in CustomBlendNote. */}
      <CustomBlendNote />

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
          {/* Single column since Lotti came out of the right-hand slot — a
              two-column grid with nothing in the second one just pushes the
              text into a narrow strip. */}
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
        </div>
      </section>
    </PublicShell>
  );
}
