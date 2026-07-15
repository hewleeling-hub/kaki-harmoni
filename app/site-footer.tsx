import Link from "next/link";
import {
  BUSINESS_WHATSAPP_NUMBER,
  BUSINESS_CALL_NUMBER,
  BUSINESS_CALL_DISPLAY,
  whatsAppLink,
} from "@/lib/whatsapp";

const IG_URL = "https://www.instagram.com/kakiharmoni/";
const FB_URL = "https://facebook.com/KakiHarmoni";
const EMAIL = "hello@kakiharmoni.com";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const wa = whatsAppLink(
    BUSINESS_WHATSAPP_NUMBER,
    "Hi Kaki Harmoni! I'd like to book a visit."
  );

  return (
    <footer className="border-t border-black/5 mt-16" style={{ backgroundColor: "var(--lagoon-dark)" }}>
      <div className="mx-auto max-w-5xl px-6 py-12 grid gap-10 md:grid-cols-3 text-white/85">
        <div className="space-y-2">
          <p className="font-display text-2xl font-semibold text-white" aria-label="Kaki Harmoni">
            Kaki Harm
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: "0.62em",
                height: "0.62em",
                verticalAlign: "baseline",
                margin: "0 0.02em",
                fill: "var(--clay)",
              }}
            >
              <path d="M12 21s-7.55-4.87-10.1-9.4C0.35 9.05 1.6 4.9 5.4 4.9c2.05 0 3.45 1.15 4.6 2.75C11.15 6.05 12.55 4.9 14.6 4.9c3.8 0 5.05 4.15 3.5 6.7C19.55 16.13 12 21 12 21z" />
            </svg>
            ni
          </p>
          <p className="text-sm text-white/70">Relax. Refresh. Reconnect.</p>
          <p className="text-sm text-white/70 max-w-xs">
            Foot hydrotherapy &amp; coffee at Desa Cindaimas Condominium Clubhouse.
          </p>
        </div>

        <div className="space-y-2">
          <p className="uppercase tracking-widest text-xs font-semibold text-white/60">Visit</p>
          <p className="text-sm">Desa Cindaimas Condominium Clubhouse</p>
          <p className="text-sm text-white/70">
            Jalan Sekutu, Taman Gembira,
            <br />
            58200 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur
          </p>
          <p className="text-sm">Open daily · 10:00am – 8:00pm</p>
          <Link href="/location" className="text-sm underline underline-offset-4 hover:text-white">
            Get directions
          </Link>
        </div>

        <div className="space-y-2">
          <p className="uppercase tracking-widest text-xs font-semibold text-white/60">Connect</p>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="block text-sm hover:text-white">
            WhatsApp us
          </a>
          <a href={`tel:+${BUSINESS_CALL_NUMBER}`} className="block text-sm hover:text-white">
            Call {BUSINESS_CALL_DISPLAY}
          </a>
          <a href={`mailto:${EMAIL}`} className="block text-sm hover:text-white">
            {EMAIL}
          </a>
          <div className="flex gap-4 pt-1">
            <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white">
              Instagram
            </a>
            <a href={FB_URL} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white">
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-5 flex flex-col sm:flex-row gap-2 justify-between text-xs text-white/50">
          <p>© {year} AQUAHARMONI SDN BHD (SSM No. 202601020397). All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-white/80">About</Link>
            <Link href="/contact" className="hover:text-white/80">Contact</Link>
            <Link href="/dashboard" className="hover:text-white/80">Staff login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
