import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Button, SectionHeading } from "@/components/ui/primitives";
import {
  MapPinIcon,
  NavigationIcon,
  MessageIcon,
  PhoneIcon,
  ClockIcon,
  InfoIcon,
} from "@/components/ui/icons";
import {
  businessConfig,
  directionsLink,
  mapEmbedSrc,
  telLink,
  whatsappLink,
} from "@/config/business";

export const metadata: Metadata = {
  title: "Find Us — Location & Hours | Kaki Harmoni",
  description:
    "Find Kaki Harmoni at Desa Cindaimas Condominium Clubhouse, Kuala Lumpur. Directions, opening hours and contact details for a warm leg soak and a friendly coffee.",
};

const VISIT_INFO = [
  { label: "Parking", value: "Free parking available on site at the clubhouse." },
  { label: "Who can visit", value: "Everyone is welcome — you do not need to live at Desa Cindaimas. Visitors and walk-ins are always welcome." },
  { label: "Entrance", value: "Inside the Desa Cindaimas clubhouse. Walk in through the main clubhouse entrance and look for the Kaki Harmoni signboard." },
  { label: "Accessibility", value: "Ground-floor access. Let our team know if you'd like a hand getting settled." },
  { label: "Booking", value: "Walk-ins welcome, but with only four soaking stations, booking ahead is advisable. Reserve online or message us on WhatsApp." },
];

export default function FindUsPage() {
  const { address, hours, callDisplay, bookingStartLabel } = businessConfig;

  return (
    <PublicShell>
      <PageHeader
        title="Find Us"
        subtitle="Come by for a warm soak, a quiet break and a friendly cup of coffee."
        image={{ src: "/shop/entrance.png", alt: "The Kaki Harmoni entrance — the AQUAHARMONI SDN BHD signboard, glass doors with Lotti waving hello, and Open Daily 10am–8pm", width: 1092, height: 1456 }}
      />

      {/* The wayfinding line that used to caption the standalone photo. The photo
          now sits in the header, so the instruction moves with it. */}
      {/* The trading name, not the company name. AQUAHARMONI SDN BHD is the
          small ownership line on the signboard; "Kaki Harmoni" is the part
          somebody standing in the clubhouse can actually read from a distance,
          and the only name they know us by. The legal name stays in the
          footer, where it belongs. */}
      <p className="mt-3 text-center text-[15px] text-muted">
        Look for the <span className="font-semibold text-olive-dark">Kaki Harmoni</span> sign
        — Lotti will be waving you in.
      </p>

      {/* Removes the single biggest access doubt before anyone reads further. */}
      <p className="mt-6 rounded-[22px] border border-olive/25 bg-sage/25 px-6 py-5 text-center text-[18px] leading-relaxed text-olive-dark">
        <strong>Not a resident? You&rsquo;re welcome too.</strong> Kaki Harmoni is open to
        everyone — you don&rsquo;t need to live at Desa Cindaimas to come and soak.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <div className="flex items-start gap-3">
            <span className="mt-1 text-olive">
              <MapPinIcon size={26} />
            </span>
            <div>
              <h2 className="text-[22px] text-olive-dark">{businessConfig.name}</h2>
              <address className="mt-1 not-italic text-[16px] leading-relaxed text-muted">
                {address.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Button href={directionsLink} icon={<NavigationIcon size={20} />} full>
              Get Directions
            </Button>
            <Button
              href={whatsappLink("Hi Kaki Harmoni! Could you share directions to the clubhouse?")}
              variant="secondary"
              icon={<MessageIcon size={20} />}
              full
            >
              WhatsApp Us
            </Button>
            <Button href={telLink} variant="secondary" icon={<PhoneIcon size={20} />} full>
              Call
            </Button>
          </div>
          <p className="mt-3 text-[14px] text-muted">{callDisplay}</p>
        </Card>

        <Card className="flex flex-col bg-cream/60">
          <div className="flex items-center gap-3">
            <span className="text-olive">
              <ClockIcon size={26} />
            </span>
            <h2 className="text-[22px] text-olive-dark">Opening hours</h2>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-[16px] border border-line bg-ivory px-4 py-3">
            <div>
              <p className="text-[17px] font-semibold text-olive-dark">{hours.label}</p>
              <p className="text-[16px] text-muted">{hours.display}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-sm font-semibold text-[#3c5230]">
              <span className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden />
              Now booking
            </span>
          </div>
          <p className="mt-3 text-[14px] text-muted">{hours.lastSoak}</p>
          <p className="mt-1 text-[14px] text-muted">
            Booking is open — first visits from {bookingStartLabel}. Reserve now to lock the launch price.
          </p>
        </Card>
      </div>

      <section className="mt-6">
        <div className="overflow-hidden rounded-[24px] border border-line shadow-[var(--shadow-warm)]">
          <iframe
            title={`Map showing ${businessConfig.name} at ${address.name}`}
            src={mapEmbedSrc}
            className="h-[320px] w-full sm:h-[380px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading eyebrow="Good to know" title="Planning your visit" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {VISIT_INFO.map((info) => (
            <Card key={info.label} className="flex items-start gap-3 bg-ivory">
              <span className="mt-0.5 text-olive">
                <InfoIcon size={22} />
              </span>
              <div>
                <h3 className="text-[17px] font-semibold text-olive-dark">{info.label}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{info.value}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
