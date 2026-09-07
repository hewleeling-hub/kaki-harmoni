import type { Metadata } from "next";
import Image from "next/image";
import { PublicShell } from "@/components/layout/PublicShell";
import { Button, Card } from "@/components/ui/primitives";
import { CalendarIcon, MapPinIcon } from "@/components/ui/icons";
import { businessConfig } from "@/config/business";

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
          {/* A greeting rather than a statement. "Why we opened Kaki Harmoni"
              read like a heading in an annual report, and the page that
              follows is three people talking — so it opens by introducing
              them, and the blocks below answer the why. */}
          Hello from the three of us.
        </h1>

        {/* One group photo rather than three cropped circles. A drawing used to
            open this page, which is the wrong thing for the one page whose job
            is showing that real people run this — and the three of them
            together says more than three portraits would. Sits under the
            greeting so you meet them before they each speak.

            Capped at 560px and centred rather than running the full column
            width: at full width it pushed all three voices below the fold, and
            the point of the layout below is that you can see them at once. */}
        <figure className="mx-auto mt-6 max-w-[560px] overflow-hidden rounded-[22px] border border-line shadow-[var(--shadow-warm)]">
          <Image
            src="/founders/the-three-of-us.png"
            alt="The three of us outside Kaki Harmoni in our aprons, beside Lotti's welcome sign"
            width={1448}
            height={1086}
            priority
            sizes="(max-width: 640px) 100vw, 560px"
            className="h-auto w-full object-cover"
          />
        </figure>

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
        {/* Three cards side by side, not three stacked quote blocks. Stacked,
            they were three identical shapes with the same left rule, and Lee
            Ling's ran long enough that most readers never reached Kimberly.
            Side by side the whole section is one screen, so nobody is buried.

            The narrower column is what forces the trims below. Each quote is
            about thirty-five words — roughly six lines in a third of a
            768px column — and all three are within two words of each other, so
            the cards come out the same height without stretching.

            Nothing is rewritten into words the speaker didn't use. Each block
            keeps ONE idea and drops the second: Margret's daily habit (not the
            grandchild), Lee Ling's "shall we?" (not the aches), Kimberly's
            corner to sit in (not the naming of Desa Cindaimas, which the
            paragraph below already does). Anything added back needs something
            else taken out, or the cards go ragged again. */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {/* Margret's own words. "Like brushing my teeth" reframes a soak from
              a treat you occasionally justify into an ordinary daily thing —
              precisely what the routine ladder sells, and someone who accepts
              that comparison has already accepted coming regularly. The bubbles
              line is the only sensory beat on the page, so it survives the cut.
              What went is "travelling is the only thing that stops me" — the
              most expendable clause here, being colour on the habit rather than
              the habit itself.

              The grandchild is her REASON for valuing the habit, not a result
              of it. "I soak daily and I can keep up with my toddler grandchild"
              reads as cause and effect — a claim about physical function we
              cannot make, and the same line we already declined to draw for the
              ankle and the stroke. Wanting to keep up with him claims nothing
              and says the warmer thing anyway. */}
          <Card as="article" className="flex flex-col gap-2.5 bg-ivory">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-olive">
              Margret
            </p>
            <blockquote className="text-[16px] leading-relaxed text-muted">
              Ten years with a spa at home, and I still soak every day I&apos;m here.
              It&apos;s a habit now, like brushing my teeth — and the bubbles start the
              day in a good mood.
            </blockquote>
          </Card>

          {/* "Somewhere that makes the answer to 'shall we?' yes a little more
              often" is the best sentence on this page: it is the only line that
              names what someone actually gains, and it does it without going
              anywhere near a health claim. It is kept whole and the setup is
              trimmed around it — "fifteen minutes, no appointment, no fuss" is
              gone, because the FAQ and the homepage both say that already,
              while nothing else on the site says this. */}
          <Card as="article" className="flex flex-col gap-2.5 bg-ivory">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-olive">
              Lee Ling
            </p>
            <blockquote className="text-[16px] leading-relaxed text-muted">
              My mother is 78. She and her friends would hang back from an outing rather
              than slow anyone down. I wanted somewhere close by that makes the answer to
              &ldquo;shall we?&rdquo; yes more often.
            </blockquote>
          </Card>

          {/* Kimberly's reason was given as "saw the benefits and wanted to
              bring it to the community". "Benefits" is the same vaguely medical
              word removed from Margret's line — a reader fills it in with a
              health outcome we cannot claim — so this is built on the
              community half instead.

              It must NOT argue against owning a machine: home spas are
              something the business wants people to buy, and an earlier draft
              opened with "I didn't want this to be something you had to buy a
              machine for", which talked a customer out of a product we sell.
              The pitch is the clubhouse being a place to sit down, not a
              cheaper alternative to owning one. */}
          <Card as="article" className="flex flex-col gap-2.5 bg-ivory">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-olive">
              Kimberly
            </p>
            <blockquote className="text-[16px] leading-relaxed text-muted">
              Every neighbourhood should have somewhere to sit down. A corner in our own
              clubhouse where you can kick your feet up for a quarter of an hour, have a
              coffee and see a familiar face.
            </blockquote>
          </Card>
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
