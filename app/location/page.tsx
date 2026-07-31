import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, Button, SectionHeading } from "@/components/ui/primitives";
import { OpeningBadge } from "@/components/ui/cards";
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
  { label: "Entrance", value: "Inside the residents' clubhouse — visitors and walk-ins welcome." },
  { label: "Accessibility", value: "Ground-floor access. Let our team know if you'd like a hand getting settled." },
  { label: "Booking", value: "Reserve online to lock the launch price, or message us on WhatsApp." },
];

export default function FindUsPage() {
  const { address, hours, callDisplay, launchWindow } = businessConfig;

  return (
    <PublicShell>
      <PageHeader
        title="Find Us"
        subtitle="Come by for a warm soak, a quiet break and a friendly cup of coffee."
      />

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
            <OpeningBadge when={launchWindow} />
          </div>
          <p className="mt-3 text-[14px] text-muted">{hours.lastSoak}</p>
          <p className="mt-1 text-[14px] text-muted">
            We&apos;re getting ready to open in {launchWindow} — reserve now to lock the launch price.
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
