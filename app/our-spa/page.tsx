import type { Metadata } from "next";
import Image from "next/image";
import { PublicShell } from "@/components/layout/PublicShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ctaLabels } from "@/config/business";
import { Card, Button } from "@/components/ui/primitives";
import {
  WavesIcon,
  HeartIcon,
  DropletIcon,
  SparklesIcon,
  SunIcon,
  CheckIcon,
  CalendarIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Our Spa — What Makes It Different",
  description:
    "Kaki Harmoni uses a Grand Sun hydrosonic spa — fine bubbles and gentle, even warmth for a soak that feels different from an ordinary basin at home.",
};

const FEATURES = [
  {
    icon: WavesIcon,
    title: "A true hydrosonic soak",
    text: "Our Grand Sun spa isn't just warm water. Fine sound waves fill the water with millions of tiny bubbles, for a soft, fizzy, gently swirling soak you won't get from a basin at home.",
  },
  {
    icon: HeartIcon,
    title: "Warmth that sinks in",
    text: "The gentle warmth spreads slowly and evenly, a little like easing into a natural hot spring — cosy and comforting, never harsh.",
  },
  {
    icon: DropletIcon,
    title: "Clean, fresh water",
    text: "Freshly prepared water for every guest, so your soak always feels clean, light and refreshing.",
  },
  {
    icon: SunIcon,
    title: "A soft, radiant warmth",
    text: "The spa also gives off a gentle radiant warmth — a soft heat that wraps around you and makes the whole soak feel especially cosy, right down to your toes.",
  },
  {
    icon: SparklesIcon,
    title: "Made your way",
    text: "Mix and match from our 7 aromatic oils and 3 herbal spa salts to create a blend that's all your own — or ask our team to tailor one just for you.",
    wide: true,
  },
];

export default function OurSpaPage() {
  return (
    <PublicShell>
      <PageHeader
        title="More than warm water"
        subtitle="A few gentle things that make a Kaki Harmoni soak feel different."
      />

      {/* Back to the room photo. A feature panel sat here briefly, but its
          claims — "Healthier Feet", "Better Circulation", "helps remove
          impurities", "Ozone with Negative Ions", "Promotes circulation" —
          were printed INTO the artwork, and text baked into a picture can't
          be edited the way a sentence can. A photograph of the room makes no
          claim at all, which is the point of this page: show the place and
          describe how it feels.

          If a replacement panel is made without those phrases, drop it in
          here — but note it will need the full column and no crop, since
          small printed labels don't survive a 16:9 crop at 620px.

          Cropped to 16:9 and capped at 620px: at its native 4:3 across the
          full column the photo stood taller than the four cards below it, so
          the page opened with a wall of picture. */}
      <figure className="mx-auto mt-8 aspect-[16/9] max-w-[620px] overflow-hidden rounded-[24px] border border-line shadow-[var(--shadow-warm)]">
        <Image
          src="/shop/spa.png"
          alt="Inside the Kaki Harmoni soaking room — spa stations, comfortable chairs and plants"
          width={1400}
          height={1050}
          sizes="(max-width: 640px) 100vw, 620px"
          className="h-full w-full object-cover"
          priority
        />
      </figure>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
        {FEATURES.map(({ icon: Icon, title, text, wide }) => (
          <Card key={title} className={`bg-ivory ${wide ? "sm:col-span-2" : ""}`}>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-olive/12 text-olive">
              <Icon size={26} />
            </span>
            <h2 className="mt-4 text-[20px] text-olive-dark">{title}</h2>
            <p className="mt-1.5 text-[16px] leading-relaxed text-muted">{text}</p>
          </Card>
        ))}
      </section>

      {/* Massage / exercise question */}
      <section className="mt-8">
        <div className="rounded-[22px] border border-line bg-cream/60 p-6 shadow-[var(--shadow-warm)] sm:p-7">
          <h2 className="text-[20px] text-olive-dark sm:text-[22px]">Is it like a massage or exercise?</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-brown">
            Guests often ask! It&apos;s not exactly either — but it can feel a little like both. The
            swirling bubbles give your feet and legs a soft, massage-like feeling, and the gentle
            warmth leaves you loose and relaxed while you simply sit back and unwind.
          </p>
        </div>
      </section>

      {/* Basin-at-home comparison */}
      <section className="mt-10">
        <div className="rounded-[24px] border border-line bg-sage-light/40 p-6 shadow-[var(--shadow-warm)] sm:p-8">
          <h2 className="text-[24px] text-olive-dark sm:text-[26px]">Why not just soak at home?</h2>
          <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-brown">
            People often ask what makes our soak different from filling a basin at home. Quite a lot,
            really — a basin cools in a few minutes and the water just sits there.
          </p>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {[
              "Thousands of soft bubbles, not still water",
              "Warmth that stays gentle and even",
              "Fresh, clean water each time",
              "A calm place to switch off — with a coffee before or after",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[15.5px] text-olive-dark">
                <CheckIcon size={18} className="mt-0.5 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[13.5px] text-muted">
            Powered by the Grand Sun hydrosonic spa system.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-10 flex flex-col items-center gap-3 rounded-[24px] border border-line bg-beige/50 p-8 text-center">
        <h2 className="text-[26px] text-olive-dark">Come feel the difference</h2>
        <p className="max-w-md text-[17px] text-brown">
          Fifteen warm minutes for your legs and feet — reserve your first visit.
        </p>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row">
          <Button href="/#reserve" size="lg" icon={<CalendarIcon size={22} />}>
            {ctaLabels.firstVisit}
          </Button>
          <Button href="/experiences" variant="secondary" size="lg" iconRight={<ArrowRightIcon size={20} />}>
            See the Experiences
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
