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
        <Image
          src="/kaki-welcome.png"
          alt="Welcome to Kaki Harmoni — Relax. Refresh. Reconnect."
          width={420}
          height={315}
          className="mb-6 w-full max-w-sm rounded-[22px] object-contain"
        />
        <p className="text-xs font-semibold uppercase tracking-widest text-olive">About us</p>
        <h1 className="mt-3 text-[34px] leading-tight text-olive-dark sm:text-[44px]">Come rest those feet.</h1>

        <div className="mt-6 space-y-5 text-[18px] leading-relaxed text-muted">
          <p>
            Hi, I&apos;m Lotti! 🌸 The little lotus who looks after the warmest corner of Desa
            Cindaimas — warm leg soaks and good coffee.
          </p>
          <p>
            The idea&apos;s small on purpose: fifteen quiet minutes with your feet in warm, bubbly
            water. Come as you are, bring a friend or don&apos;t — I&apos;ve saved you a spot. Relax,
            refresh, reconnect. 💛
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
