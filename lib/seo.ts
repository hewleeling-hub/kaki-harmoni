import type { Metadata } from "next";
import { businessConfig } from "@/config/business";

/**
 * Per-page share card.
 *
 * Next inherits `openGraph` from the root layout only when a page doesn't
 * define its own metadata at all — the moment a page exports a title and
 * description, as all of ours do, its share card silently falls back to the
 * root's title and description rather than its own. So every page that people
 * actually paste needs its own openGraph block, and writing four of them by
 * hand is four places for the title and the description to drift apart.
 *
 * One image for every page, deliberately. A share card is read at thumbnail
 * size and its job is "this is a real place, here it is" — the reception shot
 * does that on any page, where a per-page crop of a product bottle or a group
 * photo would either be unreadable small or have faces cut off by a 1200×630
 * crop.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** Route path, e.g. "/prices". Resolved against metadataBase. */
  path: string;
}): Metadata {
  const image = {
    url: "/og/kaki-harmoni.png",
    width: 1200,
    height: 630,
    alt: `Inside ${businessConfig.name} — the reception counter and café seating at ${businessConfig.address.name}`,
  };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_MY",
      siteName: businessConfig.name,
      title,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
