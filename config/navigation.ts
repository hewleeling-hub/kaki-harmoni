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

/** Mobile bottom navigation — four simple tabs. */
export const mobileNav: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "About", href: "/about", icon: "info" },
  { label: "Find Us", href: "/location", icon: "mappin" },
  { label: "Contact", href: "/contact", icon: "user" },
];
