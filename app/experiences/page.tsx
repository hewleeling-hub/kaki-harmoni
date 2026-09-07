import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PublicShell } from "@/components/layout/PublicShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/primitives";
import { ExperienceList } from "@/components/experiences/ExperienceList";
import { CustomBlendNote } from "@/components/experiences/CustomBlendNote";
import {
  ArmchairIcon,
  WavesIcon,
  CoffeeIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = pageMetadata({
  title: "Our Signature Experiences — Kaki Harmoni",
  description:
    "Four warm ways to unwind at Kaki Harmoni — Deep Calm, Gentle Comfort, Fresh Start and Light Legs. A cosy 15-minute leg soak, good coffee and a moment to slow down.",
  path: "/experiences",
});

const EXPECT = [
  { icon: ArmchairIcon, title: "Get Comfortable", text: "Sit back, settle in and choose your experience." },
  { icon: WavesIcon, title: "Soak & Relax", text: "Enjoy your warm 15-minute Kaki Harmoni soak." },
  { icon: CoffeeIcon, title: "Stay a Little Longer", text: "Enjoy coffee, conversation or simply take your time." },
];

export default function ExperiencesPage() {
  return (
    <PublicShell>
      {/* The old hero was an eyebrow reading SIGNATURE EXPERIENCES above a
          60px headline reading Our Signature Experiences — the same three
          words twice — then "Fifteen minutes of pure relaxation. You deserve
          it.", which is a mood, not information. Half a screen saying nothing
          the nav hadn't already said.

          This says the one thing a first-time reader doesn't know and can't
          work out from four card titles: the four aren't different treatments
          at different prices, they're the same soak with a different blend, so
          you choose by mood rather than by researching them. Same PageHeader
          as Our Spa and Prices, so it's compact and the cards start high.

          No "Book Now" here either. The closing CTA asks once you've picked
          one; asking at the top asks before the reader knows what they'd be
          booking. */}
      <PageHeader
        title="Four ways to soak"
        subtitle="Every visit is the same fifteen minutes in the same warm water — what changes is the blend. Pick whichever matches how you'd like to feel."
      />

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
