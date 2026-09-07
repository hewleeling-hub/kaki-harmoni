/** Customer-site navigation — shared by desktop top-bar and mobile tabs. */

export type IconName = "home" | "info" | "gift" | "mappin" | "user" | "calendar" | "sparkles" | "waves";

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

/** Desktop top navigation (left of the "Reserve your spot" button). */
export const desktopNav: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "About", href: "/about", icon: "info" },
  { label: "Experiences", href: "/experiences", icon: "sparkles" },
  { label: "Our Spa", href: "/our-spa", icon: "waves" },
  { label: "Your Visit", href: "/how-it-works", icon: "info" },
  { label: "Prices", href: "/prices", icon: "gift" },
  // Sits after Prices and before Find Us: everything to the left is someone
  // deciding whether to come, everything to the right is someone who already
  // has. "What does it cost?" and "can I just walk in?" are the same moment.
  // The page has existed since launch but was only reachable from the footer.
  { label: "FAQ", href: "/faq", icon: "info" },
  { label: "Find Us", href: "/location", icon: "mappin" },
  { label: "Contact", href: "/contact", icon: "user" },
];

/**
 * Mobile bottom bar — the INTERNAL tabs only.
 *
 * It used to be Home / About / Find Us / Contact: four ways to read more, and
 * no way to book, on the device most visitors use and in the one strip of
 * screen that is always visible. MobileBottomNav now renders these two beside
 * a WhatsApp link and a Reserve button, both of which are special cases rather
 * than rows here — WhatsApp is an external <a> with no active state, and
 * Reserve is styled as the primary action, so neither fits the shape of a tab.
 *
 * About and Contact are one tap away in the top bar; neither is what someone
 * standing outside the clubhouse needs.
 */
export const mobileNav: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Find Us", href: "/location", icon: "mappin" },
];
