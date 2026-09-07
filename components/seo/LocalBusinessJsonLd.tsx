import { businessConfig, ladderPrices } from "@/config/business";

/** Canonical origin. One place, so metadata and JSON-LD can't disagree. */
export const SITE_URL = "https://www.kakiharmoni.com";

/**
 * Machine-readable business facts for search engines.
 *
 * Worth more here than on most sites: the entire catchment is people within a
 * few kilometres, so "foot spa near me" and the Maps panel are the search that
 * matters, and neither can read an address that only exists as styled text in
 * a footer.
 *
 * EVERY value is derived from config/business.ts. Nothing is typed twice —
 * that file is the single source of truth, and a hardcoded phone number here
 * would be a second one, silently wrong the first time the real one changes.
 */
export function LocalBusinessJsonLd() {
  const { name, legalName, address, hours, email, callNumber, social } = businessConfig;

  const data = {
    "@context": "https://schema.org",
    // HealthAndBeautyBusiness rather than DaySpa: it is the closest type that
    // doesn't imply treatments we don't offer.
    "@type": "HealthAndBeautyBusiness",
    "@id": `${SITE_URL}/#business`,
    name,
    legalName,
    url: SITE_URL,
    image: `${SITE_URL}/og/kaki-harmoni.png`,
    // Numbers reach schema.org in E.164, not as printed. callNumber is stored
    // country-prefixed and digits-only, so it only needs the plus.
    telephone: `+${callNumber}`,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.lines.slice(0, 2).join(", "),
      addressLocality: "Kuala Lumpur",
      postalCode: "58200",
      addressCountry: "MY",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: `${String(hours.openHour).padStart(2, "0")}:00`,
        closes: `${String(hours.closeHour).padStart(2, "0")}:00`,
      },
    ],
    // Cheapest single visit to the top of the ladder.
    priceRange: `RM${businessConfig.pricing.prepay}–RM${ladderPrices.thirtyVisit}`,
    currenciesAccepted: "MYR",
    // Rednote is nullable by design — a withdrawn channel disappears from the
    // site, so it must disappear from here too rather than becoming "null".
    sameAs: [social.instagram, social.facebook, social.rednote].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      // Server-rendered constant built from config — no user input reaches it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
