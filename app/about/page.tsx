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
          Why we opened Kaki Harmoni.
        </h1>

        {/* TWO voices, attributed. This was one undifferentiated "I" that said
            both "my mother" and "I've soaked for ten years" — two different
            people merged into one narrator, which would have come apart the
            first time a guest met them both.

            Splitting them also answers a question the reader would otherwise
            carry unasked — why are there two of you? One saw the need, the
            other already had the answer at home. And Margret's ten years reads
            as testimony now it has a name on it, rather than as a claim.

            The family stories behind this business include an ankle that
            recovered and a stroke. They are deliberately absent: a foot spa
            claiming to restore mobility is a medical claim, needs Medicine
            Advertisements Board approval in Malaysia, and is the exact thing
            docs/leg-spa-benefits.md says to keep off this site. Wanting to keep
            up with the people you love is a feeling, not a cure — just as
            moving, and defensible. Keep it that way. */}
        <div className="mt-8 space-y-8">
          {/* Margret's own words. "Like brushing my teeth" reframes a soak from
              a treat you occasionally justify into an ordinary daily thing —
              precisely what the routine ladder sells, and someone who accepts
              that comparison has already accepted coming regularly. The bubbles
              line is the only sensory beat on the page. And "travelling is the
              only thing that stops me" stays because an inconvenient exception
              is what makes a habit read as real rather than as marketing.

              The grandchild is her REASON for valuing the habit, not a result
              of it. "I soak daily and I can keep up with my toddler grandchild"
              reads as cause and effect — a claim about physical function we
              cannot make, and the same line we already declined to draw for the
              ankle and the stroke. Wanting to keep up with him claims nothing
              and says the warmer thing anyway. */}
          <figure>
            <figcaption className="text-[15px] font-semibold uppercase tracking-wide text-olive">
              Margret
            </figcaption>
            <blockquote className="mt-2 border-l-2 border-line pl-5 text-[18px] leading-relaxed text-muted">
              I&apos;ve had a spa at home for more than ten years, and I soak every day I&apos;m
              home. It&apos;s become a habit, not unlike brushing my teeth, and the bubbles set
              the day off in a good mood. I&apos;ve a toddler grandchild to keep up with, so
              those fifteen minutes are ones I don&apos;t skip — travelling is the only thing
              that stops me.
            </blockquote>
          </figure>

          <figure>
            <figcaption className="text-[15px] font-semibold uppercase tracking-wide text-olive">
              Lee Ling
            </figcaption>
            <blockquote className="mt-2 border-l-2 border-line pl-5 text-[18px] leading-relaxed text-muted">
              My mother is 78. What I kept noticing wasn&apos;t the aches themselves — it was how
              often she and her friends would hang back from an outing, saying they&apos;d only
              slow everyone down. So I wanted somewhere close by that asked nothing of them:
              fifteen minutes, no appointment, no fuss. Somewhere that makes the answer to
              &ldquo;shall we?&rdquo; yes a little more often.
            </blockquote>
          </figure>

          {/* Kimberly's reason was given as "saw the benefits and wanted to
              bring it to the community". "Benefits" is the same vaguely medical
              word we removed from Margret's line — a reader fills it in with a
              health outcome we cannot claim. Her actual motive is ACCESS, which
              is both safe and more specific: not owning a machine, not driving
              across town, but the clubhouse people already walk through. */}
          <figure>
            <figcaption className="text-[15px] font-semibold uppercase tracking-wide text-olive">
              Kimberly
            </figcaption>
            <blockquote className="mt-2 border-l-2 border-line pl-5 text-[18px] leading-relaxed text-muted">
              I didn&apos;t want this to be something you had to buy a machine for, or drive
              across town for. Desa Cindaimas has the space and it has the people — putting it
              in our own clubhouse means it&apos;s simply there on an ordinary Tuesday, for
              neighbours who&apos;d never make a special trip of it.
            </blockquote>
          </figure>
        </div>

        <div className="mt-8 space-y-5 text-[18px] leading-relaxed text-muted">
          {/* The founder's reason for opening is, word for word, the argument
              `whyNotAtHome` already makes on the homepage: fresh water, salts
              and oils you wouldn't keep in, nothing to clean up. Worth keeping
              the two in step — a sales point lands differently when it turns
              out to be why the place exists. */}
          <p>
            But a home spa is a serious outlay, and even once you have one there&apos;s water to
            run, salts and oils to measure out, and the whole lot to clean up afterwards. Kaki
            Harmoni is the same fifteen minutes without any of that — the water&apos;s ready, the
            blend is made up for you, there&apos;s a coffee waiting, and someone else clears it
            all away.
          </p>
          <p>
            You&apos;ll find us inside the Desa Cindaimas clubhouse. No appointment weeks ahead,
            no whole afternoon set aside, and you don&apos;t need to live here — everyone is
            welcome.
          </p>
        </div>

        {/* Renders NOTHING until config/business.ts has real photographs —
            same rule as testimonials and the experience video. The welcome
            sign used to sit at the top of this page, but a drawing is exactly
            what an About page shouldn't lead with: the point is that real
            people run this. Empty is better than a stand-in. */}
        {founders.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
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
