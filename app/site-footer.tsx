import Link from "next/link";
import { BUSINESS_WHATSAPP_NUMBER, whatsAppLink } from "@/lib/whatsapp";

const IG_URL = "https://www.instagram.com/kakiharmoni/";
const FB_URL = "https://facebook.com/KakiHarmoni";
const EMAIL = "kakiharmoni@gmail.com";

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
          <p className="font-display text-2xl font-semibold text-white">Kaki Harmoni</p>
          <p className="text-sm text-white/70">Relax. Refresh. Reconnect.</p>
          <p className="text-sm text-white/70 max-w-xs">
            Foot hydrotherapy &amp; coffee at Desa Cindaimas Condominium Clubhouse.
          </p>
        </div>

        <div className="space-y-2">
          <p className="uppercase tracking-widest text-xs font-semibold text-white/60">Visit</p>
          <p className="text-sm">Desa Cindaimas Condominium Clubhouse</p>
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
          <p>© {year} Kaki Harmoni. All rights reserved.</p>
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
