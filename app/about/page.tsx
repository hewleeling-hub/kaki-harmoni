import type { Metadata } from "next";
import Image from "next/image";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button, Card } from "@/components/ui/primitives";
import { CalendarIcon, MapPinIcon } from "@/components/ui/icons";
import { businessConfig, founders } from "@/config/business";

export const metadata: Metadata = {
  title: "About — Kaki Harmoni",
  description:
    "Kaki Harmoni pairs a warm leg soak with freshly brewed coffee at Desa Cindaimas Condominium Clubhouse. Fifteen quiet minutes to relax, refresh and reconnect.",
};

// A few gentle reasons a Kaki Harmoni soak feels different from a basin at home.
// NOTE: softened from the original medical/technical copy per brand guidelines —
// please review the wording.
const FEATURES = [
  {
    title: "Warmth that sinks in",
    text: "Gentle, steady warmth eases through in about fifteen minutes — not a warm surface that cools off in two.",
  },
  {
    title: "A soft bubble soak",
    text: "Thousands of tiny bubbles gently swirl around tired feet. A basin of still water just can't do that.",
  },
  {
    title: "Clean, fresh water",
    text: "Fresh, clean water for every guest, so tired feet feel genuinely refreshed.",
  },
  {
    title: "A calm little corner",
    text: "A quiet, unhurried atmosphere — a gentle place to switch off for a while.",
  },
  {
    title: "Your choice of aroma",
    text: "Pick a scent to match your mood — lavender to wind down, rosemary for a fresh lift, or eucalyptus for a clean, clearing note. Seven to choose from, blended just for you.",
    wide: true,
  },
];

export default function AboutPage() {
  const { pricing } = businessConfig;
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl py-8 md:py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-olive">About us</p>
        <h1 className="mt-3 text-[34px] leading-tight text-olive-dark sm:text-[44px]">
          It started with my mother.
        </h1>

        {/* The founder's real reason, told through what he WANTED for her —
            keeping up with her friends — and not through what the spa did for
            her. The family stories behind this business include an ankle that
            recovered and a stroke, and those are deliberately not here: a foot
            spa claiming to restore mobility is a medical claim, needs Medicine
            Advertisements Board approval in Malaysia, and is the exact thing
            docs/leg-spa-benefits.md says to keep off the site. Wanting to keep
            up with the people you love is a feeling, not a cure — it is just as
            moving, and it is true. Keep it that way. */}
        <div className="mt-6 space-y-5 text-[18px] leading-relaxed text-muted">
          <p>
            She&apos;s 78. What I kept noticing wasn&apos;t the aches themselves — it was how often
            she and her friends would hang back from an outing, saying they&apos;d only slow
            everyone down. My aunt said much the same about keeping up with a toddler grandchild.
          </p>
          <p>
            Kaki Harmoni is my answer to that: a warm leg soak, a proper coffee and a comfortable
            chair, fifteen minutes from your door inside the Desa Cindaimas clubhouse. No
            appointment weeks ahead, no whole afternoon set aside, and you don&apos;t need to live
            here — everyone is welcome.
          </p>
        </div>

        {/* Renders NOTHING until config/business.ts has real photographs —
            same rule as testimonials and the experience video. The welcome
            sign used to sit at the top of this page, but a drawing is exactly
            what an About page shouldn't lead with: the point is that real
            people run this. Empty is better than a stand-in. */}
        {founders.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {founders.map((person) => (
              <figure key={person.name} className="flex items-center gap-4">
                <Image
                  src={person.photo}
                  alt={person.alt ?? person.name}
                  width={160}
                  height={160}
                  className="h-20 w-20 shrink-0 rounded-full border border-line object-cover"
                />
                <figcaption>
                  <p className="text-[17px] font-semibold text-olive-dark">{person.name}</p>
                  {person.role && <p className="text-[15px] text-muted">{person.role}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/#reserve" icon={<CalendarIcon size={20} />}>
            Reserve your first visit — RM{pricing.prepay}
          </Button>
          <Button href="/location" variant="secondary" icon={<MapPinIcon size={20} />}>
            Find Us
          </Button>
        </div>

        <section className="mt-14 border-t border-line pt-12">
          <h2 className="text-[28px] text-olive-dark sm:text-[32px]">More than a bucket of warm water</h2>
          <p className="mt-3 max-w-2xl text-[18px] leading-relaxed text-muted">
            People ask what makes a Kaki Harmoni soak different from filling a basin at home. Quite a
            lot, actually — it&apos;s a proper warm soak, made to help you unwind.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <Card key={f.title} className={`bg-cream/60 ${f.wide ? "sm:col-span-2" : ""}`}>
                <p className="text-[18px] text-olive" style={{ fontFamily: "var(--font-heading)" }}>
                  {f.title}
                </p>
                <p className="mt-1 text-[16px] leading-relaxed text-muted">{f.text}</p>
              </Card>
            ))}
          </div>

          <p className="mt-8 max-w-2xl text-[18px] leading-relaxed text-muted">
            The result? Relaxed, warmed-through feet and a quiet fifteen minutes a basin at home just
            can&apos;t give you.
          </p>

          <Button href="/#reserve" className="mt-6" icon={<CalendarIcon size={20} />}>
            Reserve your first visit — RM{pricing.prepay}
          </Button>
        </section>
      </div>
    </PublicShell>
  );
}
