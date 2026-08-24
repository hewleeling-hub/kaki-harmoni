import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading, Card, Button } from "@/components/ui/primitives";
import { StepCard } from "@/components/ui/cards";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import {
  CheckIcon,
  CalendarIcon,
  CoffeeIcon,
  HeartIcon,
  MessageIcon,
} from "@/components/ui/icons";
import { faqs, goodToKnow, visitSteps, ctaLabels } from "@/config/business";

export const metadata: Metadata = {
  title: "How It Works — Kaki Harmoni",
  description:
    "Your simple, relaxing visit to Kaki Harmoni from start to finish — reserve, prepay to lock the launch price, then pick a time slot.",
};

const STEP_ICONS = { calendar: CalendarIcon, gift: CoffeeIcon, message: MessageIcon, heart: HeartIcon } as const;

export default function HowItWorksPage() {
  return (
    <PublicShell>
      <PageHeader title="How It Works" subtitle="Your simple, relaxing visit from start to finish." />

      <section className="mt-8 space-y-4">
        {visitSteps.map((step, i) => {
          const Icon = STEP_ICONS[step.icon as keyof typeof STEP_ICONS] ?? HeartIcon;
          return (
            <StepCard
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.long}
              icon={<Icon size={28} />}
              align={i % 2 === 1 ? "right" : "left"}
            />
          );
        })}
      </section>

      <section className="mt-12">
        <SectionHeading title="Good to know before you visit" />
        <Card className="mt-5 bg-cream/60">
          <ul className="grid gap-3 sm:grid-cols-2">
            {goodToKnow.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[16px] text-brown">
                <CheckIcon size={20} className="mt-0.5 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="mt-12">
        <SectionHeading title="Frequently asked questions" />
        <div className="mt-5">
          <FAQAccordion items={faqs} />
        </div>
      </section>

      <section className="mt-12 flex flex-col items-center gap-3 rounded-[24px] border border-line bg-beige/50 p-8 text-center">
        <h2 className="text-[26px] text-olive-dark">Ready when you are</h2>
        <p className="max-w-md text-[17px] text-brown">
          Come once for RM25, see how it feels, and go from there.
        </p>
        <Button href="/#reserve" size="lg" icon={<CalendarIcon size={22} />}>
          {ctaLabels.firstVisit}
        </Button>
      </section>
    </PublicShell>
  );
}
