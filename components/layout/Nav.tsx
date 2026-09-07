"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { desktopNav, mobileNav } from "@/config/navigation";
import { ctaLabels, businessConfig, whatsappLink } from "@/config/business";
import { Button } from "@/components/ui/primitives";
import { CalendarIcon, MessageIcon, NAV_ICONS } from "@/components/ui/icons";
import { Wordmark } from "./Wordmark";

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => {
    const base = href.split("#")[0];
    return base === "/" ? pathname === "/" : pathname.startsWith(base);
  };
}

/** Desktop top navigation bar (hidden below lg). */
export function DesktopNav() {
  const isActive = useIsActive();
  return (
    <header className="sticky top-0 z-30 hidden border-b border-line bg-cream/90 backdrop-blur lg:block">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-6 py-3 xl:gap-5 xl:px-10">
        <Wordmark />
        <nav className="flex shrink-0 items-center gap-0.5 xl:gap-1" aria-label="Main">
          {desktopNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-2 py-2 text-[14px] font-medium transition xl:px-3.5 xl:text-[15px] ${
                  active ? "bg-olive/12 text-olive-dark" : "text-muted hover:bg-beige/50 hover:text-olive-dark"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto">
          <Button href="/#reserve" size="md" icon={<CalendarIcon size={20} />} className="whitespace-nowrap !px-4 xl:!px-5">
            <span className="xl:hidden">RM{businessConfig.pricing.prepay} Soak</span>
            <span className="hidden xl:inline">{ctaLabels.firstVisitShort}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

/** Compact top bar for mobile/tablet (hidden on lg). */
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-cream/95 px-4 py-2.5 backdrop-blur lg:hidden">
      <Wordmark showTagline={false} />
      <Button
        href="/#reserve"
        size="md"
        className="ml-auto !min-h-11 !px-4 text-[15px]"
        icon={<CalendarIcon size={18} />}
      >
        <span className="whitespace-nowrap">RM{businessConfig.pricing.prepay} Soak</span>
      </Button>
    </header>
  );
}

/** Sticky bottom tab bar for mobile/tablet (hidden on lg). */
export function MobileBottomNav() {
  const isActive = useIsActive();

  /* Every tab is the same shape, so the differences between them are only the
     colour and the icon — not the height, which stays at 56px so every target
     clears the 44px minimum with room for a thumb. */
  const tab =
    "flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-[24px] px-1 py-1 text-[11.5px] font-medium transition";

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto mb-2 max-w-md px-3">
        <ul className="flex items-stretch gap-1 rounded-[30px] border border-line bg-ivory/95 px-2 py-1.5 shadow-[var(--shadow-warm-lg)] backdrop-blur">
          {mobileNav.map((item) => {
            const active = isActive(item.href);
            const Icon = NAV_ICONS[item.icon];
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`${tab} ${active ? "text-olive" : "text-brown/70"}`}
                >
                  <span
                    className={`flex h-8 w-full max-w-[64px] items-center justify-center rounded-full transition ${
                      active ? "bg-olive/12" : ""
                    }`}
                  >
                    <Icon size={22} />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}

          {/* An external link, so it can't be a NavItem: no route to compare a
              pathname against, and nothing to mark as the current page. */}
          <li className="flex-1">
            <a
              href={whatsappLink("Hi Kaki Harmoni! I'd like to ask about a visit.")}
              target="_blank"
              rel="noopener noreferrer"
              className={`${tab} text-brown/70`}
            >
              <span className="flex h-8 w-full max-w-[64px] items-center justify-center rounded-full">
                <MessageIcon size={22} />
              </span>
              WhatsApp
            </a>
          </li>

          {/* The point of the whole bar. Filled rather than another outline
              tab, and given twice the width, because a booking is what this
              strip of screen is for — the rest is navigation that can wait. */}
          <li className="flex-[2]">
            <Link
              href="/#reserve"
              className={`${tab} bg-olive px-2 text-ivory shadow-[var(--shadow-warm)]`}
            >
              <span className="flex h-8 items-center justify-center">
                <CalendarIcon size={22} />
              </span>
              Reserve · RM{businessConfig.pricing.prepay}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
