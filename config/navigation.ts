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
