"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { desktopNav, mobileNav } from "@/config/navigation";
import { ctaLabels, businessConfig, whatsappLink, telLink } from "@/config/business";
import { Button } from "@/components/ui/primitives";
import { CalendarIcon, MessageIcon, PhoneIcon, NAV_ICONS } from "@/components/ui/icons";
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

/**
 * Compact top bar for mobile/tablet (hidden on lg), with the menu behind it.
 *
 * Until this existed, a phone could reach Home, Find Us and the booking form
 * and nothing else — About, Experiences, Our Spa, Your Visit, Prices, FAQ and
 * Contact had no route on the device most visitors use. The bottom bar is
 * deliberately four actions and can't carry nine pages, so the rest live here.
 */
export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const isActive = useIsActive();
  const pathname = usePathname();

  // Tapping a link navigates without unmounting this component, so the panel
  // would otherwise stay open over the page you just asked for.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Stop the page scrolling under the panel — on iOS especially, a fixed
    // overlay over a scrolling body is how you lose your place on the page.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-cream/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <Wordmark showTagline={false} />

        <Button
          href="/#reserve"
          size="md"
          className="ml-auto !min-h-11 !px-3.5 text-[15px]"
          icon={<CalendarIcon size={18} />}
        >
          <span className="whitespace-nowrap">RM{businessConfig.pricing.prepay} Soak</span>
        </Button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Open menu"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-olive-dark transition hover:bg-beige/50"
        >
          <BurgerIcon />
        </button>
      </header>

      {/* Rendered only while open. A permanently-mounted panel translated off
          screen still holds focusable links, which a screen reader and the tab
          key both find. */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-ink/40 backdrop-blur-[2px]"
          />

          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 right-0 flex w-[86%] max-w-[340px] flex-col border-l border-line bg-cream shadow-[var(--shadow-warm-lg)]"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <Wordmark showTagline={false} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-olive-dark transition hover:bg-beige/50"
              >
                <CloseIcon />
              </button>
            </div>

            {/* The SAME list as the desktop bar, so the two can't drift apart
                and a page can't be reachable on one and not the other. */}
            <nav aria-label="All pages" className="flex-1 overflow-y-auto px-3 py-3">
              <ul className="flex flex-col gap-0.5">
                {desktopNav.map((item) => {
                  const active = isActive(item.href);
                  const Icon = NAV_ICONS[item.icon];
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-12 items-center gap-3 rounded-[18px] px-3 text-[17px] font-medium transition ${
                          active ? "bg-olive/12 text-olive-dark" : "text-brown hover:bg-beige/50"
                        }`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ivory text-olive">
                          <Icon size={19} />
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Both numbers, because the panel is where someone goes looking
                for a way to reach a person. */}
            <div className="border-t border-line px-4 py-4">
              <div className="flex flex-col gap-2">
                <a
                  href={whatsappLink("Hi Kaki Harmoni! I'd like to ask about a visit.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 items-center gap-2.5 rounded-[22px] border border-line bg-ivory px-4 text-[15px] font-semibold text-olive-dark transition hover:bg-beige/50"
                >
                  <MessageIcon size={19} />
                  WhatsApp {businessConfig.whatsappDisplay}
                </a>
                <a
                  href={telLink}
                  className="flex min-h-12 items-center gap-2.5 rounded-[22px] border border-line bg-ivory px-4 text-[15px] font-semibold text-olive-dark transition hover:bg-beige/50"
                >
                  <PhoneIcon size={19} />
                  Call {businessConfig.callDisplay}
                </a>
              </div>
              <p className="mt-3 text-[13px] text-muted">
                {businessConfig.hours.label} · {businessConfig.hours.display}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BurgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
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
