import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "../site-nav";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "About — Kaki Harmoni",
  description:
    "Kaki Harmoni pairs warm foot hydrotherapy with freshly brewed coffee at Desa Cindaimas Condominium Clubhouse. Fifteen quiet minutes to relax, refresh, and reconnect.",
};

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <div className="md:pl-60">
      <main className="mx-auto max-w-3xl px-6 py-10 md:py-14">
        <p className="uppercase tracking-widest text-xs font-semibold" style={{ color: "var(--clay)" }}>
          About us
        </p>
        <h1
          className="font-display text-4xl md:text-5xl font-semibold leading-tight mt-3"
          style={{ color: "var(--lagoon-dark)" }}
        >
          Come rest those feet.
        </h1>

        <div className="mt-6 space-y-5 text-lg leading-relaxed text-black/75">
          <p>
            Hi, I&apos;m Lotti! 🌸 The little lotus who runs the warmest corner of Desa
            Cindaimas — warm foot soaks and good coffee.
          </p>
          <p>
            The idea&apos;s small on purpose: fifteen minutes with your feet in warm,
            bubbly water. Come as you are, bring a friend or don&apos;t — I saved you a
            spot. Relax, refresh, reconnect. 💛
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-full px-6 py-3 text-white font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--lagoon)" }}
          >
            Book your first visit — RM25
          </Link>
          <Link
            href="/location"
            className="rounded-full px-6 py-3 font-semibold border transition-colors hover:bg-white"
            style={{ color: "var(--lagoon-dark)", borderColor: "var(--lagoon)" }}
          >
            Find us
          </Link>
        </div>
      </main>
      <SiteFooter />
      </div>
    </>
  );
}
