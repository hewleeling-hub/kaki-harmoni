import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "../site-nav";
import SiteFooter from "../site-footer";
import {
  BUSINESS_WHATSAPP_NUMBER,
  BUSINESS_CALL_NUMBER,
  BUSINESS_CALL_DISPLAY,
  whatsAppLink,
} from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact — Kaki Harmoni",
  description:
    "Get in touch with Kaki Harmoni — message us on WhatsApp, email hello@kakiharmoni.com, or follow along on Instagram and Facebook.",
};

const EMAIL = "hello@kakiharmoni.com";
const IG_URL = "https://www.instagram.com/kakiharmoni/";
const FB_URL = "https://facebook.com/KakiHarmoni";

export default function ContactPage() {
  const wa = whatsAppLink(
    BUSINESS_WHATSAPP_NUMBER,
    "Hi Kaki Harmoni! I'd like to ask about a visit."
  );

  const channels = [
    {
      label: "WhatsApp",
      value: "Message us — fastest reply",
      href: wa,
      external: true,
      cta: "Open WhatsApp",
      accent: "var(--lagoon)",
    },
    {
      label: "Call us",
      value: BUSINESS_CALL_DISPLAY,
      href: `tel:+${BUSINESS_CALL_NUMBER}`,
      external: false,
      cta: "Call now",
      accent: "var(--clay)",
    },
    {
      label: "Email",
      value: EMAIL,
      href: `mailto:${EMAIL}`,
      external: false,
      cta: "Send an email",
      accent: "var(--clay)",
    },
    {
      label: "Instagram",
      value: "@kakiharmoni",
      href: IG_URL,
      external: true,
      cta: "Follow us",
      accent: "var(--blush)",
    },
    {
      label: "Facebook",
      value: "Kaki Harmoni",
      href: FB_URL,
      external: true,
      cta: "Like our page",
      accent: "var(--lagoon)",
    },
  ];

  return (
    <>
      <SiteNav />
      <div className="md:pl-60">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="uppercase tracking-widest text-xs font-semibold" style={{ color: "var(--clay)" }}>
          Contact
        </p>
        <h1
          className="font-display text-4xl md:text-5xl font-semibold leading-tight mt-3"
          style={{ color: "var(--lagoon-dark)" }}
        >
          Say hello.
        </h1>
        <p className="mt-4 text-lg text-black/70 max-w-xl">
          Questions about a visit, a booking, or bringing a group? We&apos;d love to hear
          from you — reach us whichever way is easiest.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.external ? "_blank" : undefined}
              rel={c.external ? "noopener noreferrer" : undefined}
              className="group rounded-2xl border border-black/5 bg-white/70 p-6 transition-shadow hover:shadow-md"
            >
              <p className="uppercase tracking-widest text-xs font-semibold" style={{ color: c.accent }}>
                {c.label}
              </p>
              <p className="mt-2 text-lg font-medium" style={{ color: "var(--ink)" }}>
                {c.value}
              </p>
              <span
                className="mt-4 inline-block text-sm font-semibold transition-colors"
                style={{ color: "var(--lagoon-dark)" }}
              >
                {c.cta} →
              </span>
            </a>
          ))}
        </div>

        <div className="mt-12 rounded-2xl p-6" style={{ backgroundColor: "var(--aqua)" }}>
          <p className="font-display text-xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            Prefer to just drop by?
          </p>
          <p className="mt-1 text-black/70">
            We&apos;re open daily, 10:00am – 8:00pm, at Desa Cindaimas Condominium
            Clubhouse.
          </p>
          <Link
            href="/location"
            className="mt-4 inline-block rounded-full px-6 py-3 text-white font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--lagoon)" }}
          >
            Get directions
          </Link>
        </div>
      </main>
      <SiteFooter />
      </div>
    </>
  );
}
