import Link from "next/link";
import { businessConfig, whatsappLink, telLink, mapsSearchLink } from "@/config/business";

export function SiteFooter() {
  const wa = whatsappLink("Hi Kaki Harmoni! I'd like to reserve a visit.");

  return (
    <footer className="mt-16 border-t border-line bg-olive-dark text-ivory/85">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-12 sm:px-8 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-2xl text-ivory" style={{ fontFamily: "var(--font-heading)" }}>
            Kaki Harmoni
          </p>
          <p className="text-sm text-ivory/70">{businessConfig.tagline}</p>
          <p className="max-w-xs text-sm text-ivory/70">
            A warm leg soak and good coffee at Desa Cindaimas Condominium Clubhouse.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-ivory/60">Visit</p>
          {businessConfig.address.lines.map((line) => (
            <p key={line} className="text-sm text-ivory/80">
              {line}
            </p>
          ))}
          <p className="text-sm">
            {businessConfig.hours.label} · {businessConfig.hours.display}
          </p>
          <Link href="/location" className="text-sm underline underline-offset-4 hover:text-ivory">
            Find us & directions
          </Link>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-ivory/60">Connect</p>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="block text-sm hover:text-ivory">
            WhatsApp us
          </a>
          <a href={telLink} className="block text-sm hover:text-ivory">
            Call {businessConfig.callDisplay}
          </a>
          <a href={`mailto:${businessConfig.email}`} className="block text-sm hover:text-ivory">
            {businessConfig.email}
          </a>
          <div className="flex gap-4 pt-1">
            <a href={businessConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-ivory">
              Instagram
            </a>
            <a href={businessConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-ivory">
              Facebook
            </a>
          </div>
          <a href={mapsSearchLink} target="_blank" rel="noopener noreferrer" className="block pt-1 text-sm underline underline-offset-4 hover:text-ivory">
            Open in Google Maps
          </a>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-2 px-6 py-5 text-xs text-ivory/50 sm:flex-row sm:px-8">
          <p>
            © {new Date().getFullYear()} {businessConfig.legalName} (SSM No. {businessConfig.ssm}). All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-ivory/80">About</Link>
            <Link href="/contact" className="hover:text-ivory/80">Contact</Link>
            <Link href="/dashboard" className="hover:text-ivory/80">Staff login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
