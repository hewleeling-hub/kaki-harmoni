"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/location", label: "Location" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const close = () => setOpen(false);

  const panel = (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-4">
        <Link href="/" onClick={close} aria-label="Kaki Harmoni home">
          <Logo size="sm" />
        </Link>
      </div>

      <div className="flex-1 px-3 space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={close}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium transition"
            style={
              isActive(l.href)
                ? { background: "rgba(46,125,123,0.12)", color: "var(--lagoon-dark)" }
                : { color: "rgba(0,0,0,0.65)" }
            }
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="px-5 py-5">
        <Link
          href="/"
          onClick={close}
          className="block text-center text-sm font-semibold rounded-full px-4 py-2.5 text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--lagoon)" }}
        >
          Book your visit
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed left sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 bg-[var(--cream)]/95 backdrop-blur border-r border-black/5 flex-col z-40">
        {panel}
      </aside>

      {/* Mobile: top bar + hamburger */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-[var(--cream)]/90 backdrop-blur border-b border-black/5 px-4 h-16">
        <Link href="/" onClick={close} aria-label="Kaki Harmoni home">
          <Logo size="sm" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-lg border border-black/10"
          style={{ color: "var(--lagoon-dark)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="7" x2="21" y2="7" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="17" x2="21" y2="17" />
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={close} />
          <div className="absolute inset-y-0 left-0 w-64 bg-[var(--cream)] shadow-xl flex flex-col">
            <div className="flex justify-end p-3">
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="p-2 rounded-lg border border-black/10"
                style={{ color: "var(--lagoon-dark)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>
            </div>
            <div className="flex-1 -mt-6">{panel}</div>
          </div>
        </div>
      )}
    </>
  );
}
