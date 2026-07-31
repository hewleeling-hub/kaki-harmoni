import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading, Card, Button } from "@/components/ui/primitives";
import { PromotionCard } from "@/components/ui/cards";
import { CalendarIcon, CheckIcon, MessageIcon } from "@/components/ui/icons";
import { businessConfig, whatsappLink } from "@/config/business";

export const metadata: Metadata = {
  title: "Prices — Kaki Harmoni",
  description:
    "Kaki Harmoni launch pricing: your first visit is RM25 when you prepay online, or RM30 at the door — a warm leg soak and a coffee, together.",
};

export default function PricesPage() {
  const { pricing, launchWindow } = businessConfig;

  return (
    <PublicShell>
      <PageHeader title="Prices" subtitle="One simple, friendly launch offer for your first visit.">
        <Button href="/#reserve" size="lg" icon={<CalendarIcon size={22} />} className="hidden sm:inline-flex">
          Reserve your spot
        </Button>
      </PageHeader>

      <section className="mt-8 grid gap-5 sm:grid-cols-2">
        <Card className="flex flex-col text-center ring-2 ring-olive/50">
          <p className="text-sm font-semibold uppercase tracking-wide text-olive">Prepay online · best value</p>
          <p className="mt-3 text-5xl font-bold text-olive" style={{ fontFamily: "var(--font-heading)" }}>
            RM{pricing.prepay}
          </p>
          <p className="mt-1 text-[15px] text-muted line-through">Usually RM{pricing.normal}</p>
          <p className="mt-3 text-[16px] leading-relaxed text-muted">
            Lock the launch price for your first visit. A warm 15-minute leg soak and a coffee.
          </p>
          <Button href="/#reserve" full className="mt-5" icon={<CalendarIcon size={20} />}>
            Reserve your spot
          </Button>
        </Card>

        <Card className="flex flex-col text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brown">Pay at the door</p>
          <p className="mt-3 text-5xl font-bold text-brown" style={{ fontFamily: "var(--font-heading)" }}>
            RM{pricing.walkin}
          </p>
          <p className="mt-1 text-[15px] text-muted">First visit</p>
          <p className="mt-3 text-[16px] leading-relaxed text-muted">
            Reserve your spot now and settle when you arrive. Same warm soak and coffee.
          </p>
          <Button href="/#reserve" variant="secondary" full className="mt-5">
            Reserve your spot
          </Button>
        </Card>
      </section>

      <div className="mt-5">
        <PromotionCard
          highlight={`Save RM${pricing.normal - pricing.prepay}`}
          title="Launch price for first visits"
          description="Prepay online to lock the launch price. We'll WhatsApp you to pick a time once we open."
          terms={`Launch offer for a first visit. Opening ${launchWindow}.`}
        />
      </div>

      <section className="mt-12">
        <SectionHeading title="What's included" />
        <Card className="mt-5 bg-cream/60">
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "A warm 15-minute leg soak",
              "A freshly made coffee or tea",
              "A comfortable place to rest",
              "Time to relax and reconnect",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[16px] text-brown">
                <CheckIcon size={20} className="mt-0.5 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
        <p className="mt-4 text-[14px] text-muted">
          Multi-visit passes are on the way. Ask us on WhatsApp and we&apos;ll let you know when they&apos;re ready.
        </p>
      </section>

      <section className="mt-12 flex flex-col items-center gap-3 rounded-[24px] border border-line bg-beige/50 p-8 text-center">
        <h2 className="text-[26px] text-olive-dark">Questions about pricing?</h2>
        <p className="max-w-md text-[17px] text-brown">We&apos;re happy to help — message us anytime.</p>
        <Button
          href={whatsappLink("Hi Kaki Harmoni! I have a question about prices.")}
          size="lg"
          icon={<MessageIcon size={22} />}
        >
          WhatsApp Us
        </Button>
      </section>
    </PublicShell>
  );
}
