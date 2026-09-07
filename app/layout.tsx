import type { Metadata } from "next";
import "./globals.css";
import { businessConfig } from "@/config/business";
import { LocalBusinessJsonLd, SITE_URL } from "@/components/seo/LocalBusinessJsonLd";

const TITLE = "Kaki Harmoni | Your 15-Minute Daily Reset";
const DESCRIPTION =
  `A warm 15-minute leg soak and a good coffee at ${businessConfig.address.name}, Kuala Lumpur — short enough to fit into every day. Try your first soak for RM${businessConfig.pricing.prepay}; first visits from ${businessConfig.bookingStartLabel}.`;

/**
 * The share card. Without openGraph, a link pasted into WhatsApp renders as a
 * grey box with a URL — on the channel this business actually launches
 * through, where a forwarded link is the whole marketing funnel.
 *
 * `metadataBase` is what makes the relative image path below resolve to an
 * absolute URL. Miss it and Next silently emits a relative og:image, which no
 * scraper will fetch.
 *
 * The image is cropped to 1200×630 in /public/og rather than pointing at the
 * 1448×1086 original: left to crop it themselves, the platforms take the
 * middle and cut the branded counter out of frame.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_MY",
    siteName: businessConfig.name,
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [
      {
        url: "/og/kaki-harmoni.png",
        width: 1200,
        height: 630,
        alt: `Inside ${businessConfig.name} — the reception counter and café seating at ${businessConfig.address.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og/kaki-harmoni.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <LocalBusinessJsonLd />
      </head>
      <body className="antialiased" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
        {children}
      </body>
    </html>
  );
}
