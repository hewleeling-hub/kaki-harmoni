import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { Button } from "@/components/ui/primitives";
import { MessageIcon, CalendarIcon } from "@/components/ui/icons";
import { faqs, whatsappLink, ctaLabels } from "@/config/business";

export const metadata: Metadata = {
  title: "FAQ — Kaki Harmoni",
  description:
    "Answers to common questions about Kaki Harmoni — visits, pricing, walk-ins, what to wear, water hygiene and more.",
};

export default function FaqPage() {
  return (
    <PublicShell>
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Everything you might like to know before your visit."
      />

      <section className="mt-8">
        <FAQAccordion items={faqs} />
      </section>

      <section className="mt-10 flex flex-col items-center gap-3 rounded-[24px] border border-line bg-beige/50 p-8 text-center">
        <h2 className="text-[26px] text-olive-dark">Still have a question?</h2>
        <p className="max-w-md text-[17px] text-brown">We&apos;re happy to help — message us anytime.</p>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row">
          <Button
            href={whatsappLink("Hi Kaki Harmoni! I have a question.")}
            size="lg"
            icon={<MessageIcon size={22} />}
          >
            WhatsApp Us
          </Button>
          <Button href="/#reserve" variant="secondary" size="lg" icon={<CalendarIcon size={22} />}>
            {ctaLabels.firstVisit}
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
