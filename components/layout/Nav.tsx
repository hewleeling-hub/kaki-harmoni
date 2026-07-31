"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { desktopNav, mobileNav } from "@/config/navigation";
import { Button } from "@/components/ui/primitives";
import { CalendarIcon, NAV_ICONS } from "@/components/ui/icons";
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
      <div className="mx-auto flex max-w-[1200px] items-center gap-5 px-8 py-3 xl:px-10">
        <Wordmark />
        <nav className="flex items-center gap-1" aria-label="Main">
          {desktopNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3.5 py-2 text-[15px] font-medium transition ${
                  active ? "bg-olive/12 text-olive-dark" : "text-muted hover:bg-beige/50 hover:text-olive-dark"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto">
          <Button href="/#reserve" size="md" icon={<CalendarIcon size={20} />}>
            Reserve your spot
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
        Reserve
      </Button>
    </header>
  );
}

/** Sticky bottom tab bar for mobile/tablet (hidden on lg). */
export function MobileBottomNav() {
  const isActive = useIsActive();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto mb-2 max-w-md px-3">
        <ul className="flex items-stretch justify-around rounded-[30px] border border-line bg-ivory/95 px-2 py-1.5 shadow-[var(--shadow-warm-lg)] backdrop-blur">
          {mobileNav.map((item) => {
            const active = isActive(item.href);
            const Icon = NAV_ICONS[item.icon];
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-[24px] px-1 py-1 text-[12px] font-medium transition ${
                    active ? "text-olive" : "text-brown/70"
                  }`}
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
        </ul>
      </div>
    </nav>
  );
}
