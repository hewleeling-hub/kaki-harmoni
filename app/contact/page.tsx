import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card } from "@/components/ui/primitives";
import { NavigationIcon } from "@/components/ui/icons";
import { businessConfig, whatsappLink, telLink } from "@/config/business";

export const metadata: Metadata = {
  title: "Contact — Kaki Harmoni",
  description:
    "Get in touch with Kaki Harmoni — message us on WhatsApp, email hello@kakiharmoni.com, or follow along on Instagram and Facebook.",
};

export default function ContactPage() {
  const wa = whatsappLink("Hi Kaki Harmoni! I'd like to ask about a visit.");

  const channels = [
    { label: "WhatsApp", value: "Message us — fastest reply", href: wa, external: true, cta: "Open WhatsApp" },
    { label: "Call us", value: businessConfig.callDisplay, href: telLink, external: false, cta: "Call now" },
    { label: "Email", value: businessConfig.email, href: `mailto:${businessConfig.email}`, external: false, cta: "Send an email" },
    { label: "Instagram", value: "@kakiharmoni", href: businessConfig.social.instagram, external: true, cta: "Follow us" },
    { label: "Facebook", value: "Kaki Harmoni", href: businessConfig.social.facebook, external: true, cta: "Like our page" },
    // Only listed once social.rednote holds a real URL — see config/business.ts.
    ...(businessConfig.social.rednote
      ? [{ label: "Rednote", value: "Kaki Harmoni", href: businessConfig.social.rednote, external: true, cta: "Follow us" }]
      : []),
  ];

  return (
    <PublicShell>
      <PageHeader
        title="Say hello."
        subtitle="Questions about a visit, a booking, or bringing a group? Reach us whichever way is easiest."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {channels.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.external ? "_blank" : undefined}
            rel={c.external ? "noopener noreferrer" : undefined}
            className="group rounded-[22px] border border-line bg-ivory p-6 shadow-[var(--shadow-warm)] transition hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-olive">{c.label}</p>
            <p className="mt-2 text-[18px] font-medium text-ink">{c.value}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-olive-dark">{c.cta} →</span>
          </a>
        ))}
      </div>

      <Card className="mt-10 bg-sage/40">
        <p className="text-[20px] text-olive-dark" style={{ fontFamily: "var(--font-heading)" }}>
          Prefer to just drop by?
        </p>
        <p className="mt-1 text-[16px] text-brown">
          Find us at Desa Cindaimas Condominium Clubhouse — {businessConfig.hours.label},{" "}
          {businessConfig.hours.display}.
        </p>
        <Button href="/location" className="mt-4" icon={<NavigationIcon size={20} />}>
          Get Directions
        </Button>
      </Card>
    </PublicShell>
  );
}
