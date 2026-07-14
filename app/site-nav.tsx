"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/location", label: "Location" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-[var(--cream)]/90 backdrop-blur border-b border-black/5">
      <nav className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
        <Link href="/" aria-label="Kaki Harmoni home" onClick={() => setOpen(false)}>
          <Logo size="sm" />
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-colors"
              style={{ color: isActive(l.href) ? "var(--clay)" : "var(--ink)" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/"
            className="text-sm font-semibold rounded-full px-4 py-2 text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--lagoon)" }}
          >
            Book your visit
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{ color: "var(--lagoon-dark)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-black/5 bg-[var(--cream)] px-6 py-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-base font-medium"
              style={{ color: isActive(l.href) ? "var(--clay)" : "var(--ink)" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="mt-2 block text-center text-base font-semibold rounded-full px-4 py-2.5 text-white"
            style={{ backgroundColor: "var(--lagoon)" }}
          >
            Book your visit
          </Link>
        </div>
      )}
    </header>
  );
}
