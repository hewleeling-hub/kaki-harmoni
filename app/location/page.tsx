import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "../site-nav";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "Location & Hours — Kaki Harmoni",
  description:
    "Find Kaki Harmoni at Desa Cindaimas Condominium Clubhouse. Open daily 10:00am to 8:00pm. Directions and parking info.",
};

const ADDRESS = "Desa Cindaimas Condominium Clubhouse";
const MAPS_QUERY = encodeURIComponent("Desa Cindaimas Condominium, Kuala Lumpur");
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
const MAPS_EMBED = `https://maps.google.com/maps?q=${MAPS_QUERY}&output=embed`;

const hours = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function LocationPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="uppercase tracking-widest text-xs font-semibold" style={{ color: "var(--clay)" }}>
          Location &amp; hours
        </p>
        <h1
          className="font-display text-4xl md:text-5xl font-semibold leading-tight mt-3"
          style={{ color: "var(--lagoon-dark)" }}
        >
          Come find us at the clubhouse.
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-2 items-start">
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon)" }}>
                Where we are
              </h2>
              <p className="mt-2 text-lg text-black/75">{ADDRESS}</p>
              <p className="mt-1 text-black/60">
                Inside the residents&apos; clubhouse — walk-ins and visitors welcome.
                Free parking available on site.
              </p>
              <Link
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 rounded-full px-6 py-3 text-white font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--lagoon)" }}
              >
                Open in Google Maps
              </Link>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon)" }}>
                Opening hours
              </h2>
              <ul className="mt-3 divide-y divide-black/5 rounded-2xl border border-black/5 bg-white/70">
                {hours.map((day) => (
                  <li key={day} className="flex justify-between px-5 py-3 text-black/75">
                    <span>{day}</span>
                    <span className="font-medium" style={{ color: "var(--lagoon-dark)" }}>
                      10:00am – 8:00pm
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-black/55">
                Last soak begins at 7:30pm. Booking ahead is recommended — we have
                four hydrotherapy stations.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/5 shadow-sm">
            <iframe
              title="Map to Kaki Harmoni at Desa Cindaimas Condominium Clubhouse"
              src={MAPS_EMBED}
              width="100%"
              height="420"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0 }}
            />
          </div>
        </div>

        <div className="mt-14">
          <Link
            href="/"
            className="rounded-full px-6 py-3 text-white font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--clay)" }}
          >
            Book your visit
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
