/** Customer-site navigation — shared by desktop top-bar and mobile tabs. */

export type IconName = "home" | "info" | "gift" | "mappin" | "user" | "calendar";

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

/** Desktop top navigation (left of the "Reserve your spot" button). */
export const desktopNav: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "How It Works", href: "/how-it-works", icon: "info" },
  { label: "Prices", href: "/prices", icon: "gift" },
  { label: "Find Us", href: "/location", icon: "mappin" },
  { label: "About", href: "/about", icon: "user" },
  { label: "Contact", href: "/contact", icon: "info" },
];

/** Mobile bottom navigation — four simple tabs. */
export const mobileNav: NavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "How It Works", href: "/how-it-works", icon: "info" },
  { label: "Prices", href: "/prices", icon: "gift" },
  { label: "Find Us", href: "/location", icon: "mappin" },
];
