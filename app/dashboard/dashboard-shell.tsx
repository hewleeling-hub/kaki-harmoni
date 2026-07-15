"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/app/logo";
import { createClient } from "@/lib/supabase/client";
import type { Role } from "@/lib/auth";

export default function DashboardShell({
  email,
  role,
  children,
}: {
  email: string;
  role: Role;
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    ...(role === "owner" || role === "manager"
      ? [
          { href: "/dashboard/retention", label: "Retention", icon: RetentionIcon },
          { href: "/dashboard/products", label: "Catalogue", icon: CatalogueIcon },
          { href: "/dashboard/team", label: "Team", icon: TeamIcon },
        ]
      : []),
    { href: "/", label: "View site", icon: SiteIcon },
  ];

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-4">
        <Logo size="sm" />
      </div>

      <div className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition"
              style={
                active
                  ? { background: "rgba(46,125,123,0.12)", color: "var(--lagoon-dark)" }
                  : { color: "rgba(0,0,0,0.65)" }
              }
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="px-5 py-4 border-t border-black/5">
        <p className="text-xs text-black/40 mb-2 truncate">{email}</p>
        <button
          onClick={signOut}
          className="w-full text-sm font-medium px-3 py-2 rounded-lg border border-black/10 hover:bg-black/5"
        >
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 bg-white/70 backdrop-blur border-r border-black/5 flex-col z-40">
        {nav}
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-white/80 backdrop-blur border-b border-black/5 px-4 py-3">
        <Logo size="sm" />
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-lg border border-black/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col">
            <div className="flex justify-end p-3">
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-lg border border-black/10"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>
            </div>
            <div className="flex-1 -mt-10">{nav}</div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="md:pl-60">
        <div className="p-6 md:p-10 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function RetentionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-6" />
    </svg>
  );
}

function CatalogueIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 6a3 3 0 0 1 0 6" />
      <path d="M18.5 20a6 6 0 0 0-3-5.2" />
    </svg>
  );
}

function SiteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
    </svg>
  );
}
