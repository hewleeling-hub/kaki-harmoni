import type { ReactNode } from "react";
import { DesktopNav, MobileHeader, MobileBottomNav } from "./Nav";
import { SiteFooter } from "./SiteFooter";

/**
 * Warm customer-site chrome: desktop top-nav + mobile top bar + sticky mobile
 * bottom nav + footer, all under `.warm`. Wrap every public page in this.
 * Staff/dashboard pages do NOT use this.
 */
export function PublicShell({
  children,
  container = true,
}: {
  children: ReactNode;
  container?: boolean;
}) {
  return (
    <div className="warm min-h-screen bg-cream text-ink">
      <DesktopNav />
      <MobileHeader />
      <main className={container ? "mx-auto max-w-[1200px] px-[18px] pb-28 pt-2 sm:px-8 lg:px-10 lg:pb-8" : "pb-28 lg:pb-8"}>
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
