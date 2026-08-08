import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading, Card, Button, Badge } from "@/components/ui/primitives";
import { PromotionCard } from "@/components/ui/cards";
import { CalendarIcon, CheckIcon, MessageIcon } from "@/components/ui/icons";
import { businessConfig, sessionRates, packages, whatsappLink } from "@/config/business";

export const metadata: Metadata = {
  title: "Prices & Packages — Kaki Harmoni",
  description:
    "Kaki Harmoni prices: first visit RM25 (prepay) / RM30 at the door, then RM40 per soak with friendly off-peak rates and money-saving packages.",
};

function PriceTile({
  name,
  price,
  detail,
  save,
  featured,
}: {
  name: string;
  price: number;
  detail: string;
  save?: number;
  featured?: boolean;
}) {
  return (
    <Card className={`flex flex-col text-center ${featured ? "ring-2 ring-olive/50" : ""}`}>
      {save ? (
        <span className="mx-auto mb-1">
          <Badge tone="gold">Save RM{save}</Badge>
        </span>
      ) : null}
      <h3 className="text-[18px] text-olive-dark">{name}</h3>
      <p className="mt-2 text-4xl font-bold text-olive" style={{ fontFamily: "var(--font-heading)" }}>
        RM{price}
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{detail}</p>
    </Card>
  );
}

export default function PricesPage() {
  const { pricing, bookingStartLabel } = businessConfig;

  return (
    <PublicShell>
      <PageHeader
        title="Prices & Packages"
        subtitle="A special price for your first visit — then simple rates and packages to suit how often you come."
      >
        <Button href="/#reserve" size="lg" icon={<CalendarIcon size={22} />} className="hidden sm:inline-flex">
          Reserve your spot
        </Button>
      </PageHeader>

      {/* First visit */}
      <section className="mt-8">
        <SectionHeading eyebrow="New here?" title="Your first visit" />
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Card className="flex flex-col text-center ring-2 ring-olive/50">
            <p className="text-sm font-semibold uppercase tracking-wide text-olive">Prepay online · best value</p>
            <p className="mt-3 text-5xl font-bold text-olive" style={{ fontFamily: "var(--font-heading)" }}>
              RM{pricing.prepay}
            </p>
            <p className="mt-1 text-[15px] text-muted line-through">Usually RM{pricing.normal}</p>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">
              Lock the launch price for your first visit — a warm 15-minute leg soak and a coffee.
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
        </div>
        <div className="mt-5">
          <PromotionCard
            highlight={`Save RM${pricing.normal - pricing.prepay}`}
            title="Launch price for first visits"
            description="Prepay online to lock the launch price, then choose a time slot from the calendar."
            terms={`First-visit launch offer. First visits from ${bookingStartLabel}.`}
          />
        </div>
      </section>

      {/* Session rates */}
      <section className="mt-12">
        <SectionHeading
          eyebrow="After your first visit"
          title="Soak rates"
          subtitle="RM40 for a standard soak, with friendlier rates at quieter times."
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {sessionRates.map((r) => (
            <PriceTile key={r.name} name={r.name} price={r.price} detail={r.detail} featured={r.name === "Standard single"} />
          ))}
        </div>
      </section>

      {/* Packages & passes */}
      <section className="mt-12">
        <SectionHeading eyebrow="Save more" title="Packages & passes" subtitle="Come often? These make every soak better value." />
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {packages.map((p) => (
            <PriceTile key={p.name} name={p.name} price={p.price} detail={p.detail} save={"save" in p ? p.save : undefined} />
          ))}
        </div>
        <p className="mt-4 text-[14px] text-muted">
          Resident pass requires proof of residence. Ask our team in store or on WhatsApp to set up any package.
        </p>
      </section>

      {/* What's included */}
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
      </section>

      {/* CTA */}
      <section className="mt-12 flex flex-col items-center gap-3 rounded-[24px] border border-line bg-beige/50 p-8 text-center">
        <h2 className="text-[26px] text-olive-dark">Questions about pricing?</h2>
        <p className="max-w-md text-[17px] text-brown">We&apos;re happy to help — message us anytime.</p>
        <Button
          href={whatsappLink("Hi Kaki Harmoni! I have a question about prices and packages.")}
          size="lg"
          icon={<MessageIcon size={22} />}
        >
          WhatsApp Us
        </Button>
      </section>
    </PublicShell>
  );
}
