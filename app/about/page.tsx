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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lotti.png"
          alt="Lotti, the Kaki Harmoni lotus mascot, soaking her feet with a coffee"
          className="w-28 h-28 md:w-36 md:h-36 object-contain mb-2"
        />
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

        <section className="mt-16 border-t border-black/5 pt-12">
          <h2 className="font-display text-3xl md:text-4xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            More than a bucket of warm water
          </h2>
          <p className="mt-3 text-lg text-black/75 max-w-2xl">
            Hi again! 🌸 People ask what makes a Kaki Harmoni soak different from
            filling a basin at home. Quite a lot, actually — ours is a proper
            hydrosonic spa, not just warm water sitting there.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/5 bg-white/70 p-6">
              <p className="font-display text-lg font-semibold" style={{ color: "var(--lagoon)" }}>
                Warmth that sinks in
              </p>
              <p className="mt-1 text-black/70">
                Ultrasonic heat warms you all the way through in about fifteen
                minutes — not a warm surface that cools off in two.
              </p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white/70 p-6">
              <p className="font-display text-lg font-semibold" style={{ color: "var(--lagoon)" }}>
                A real bubble massage
              </p>
              <p className="mt-1 text-black/70">
                Thousands of tiny bubbles a second gently massage your soles and
                pressure points. Still water can&apos;t do that.
              </p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white/70 p-6">
              <p className="font-display text-lg font-semibold" style={{ color: "var(--lagoon)" }}>
                Clean, fresh water
              </p>
              <p className="mt-1 text-black/70">
                Ozone keeps the soak hygienic and leaves tired feet feeling
                genuinely fresh.
              </p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white/70 p-6">
              <p className="font-display text-lg font-semibold" style={{ color: "var(--lagoon)" }}>
                Forest-fresh calm
              </p>
              <p className="mt-1 text-black/70">
                Negative ions and gentle far-infrared warmth add to the unwind —
                like the air beside a waterfall.
              </p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white/70 p-6 sm:col-span-2">
              <p className="font-display text-lg font-semibold" style={{ color: "var(--lagoon)" }}>
                Your choice of aroma
              </p>
              <p className="mt-1 text-black/70">
                Add a herbal oil to match your mood — lavender to wind down,
                something zesty to refresh.
              </p>
            </div>
          </div>

          <p className="mt-8 text-lg text-black/75 max-w-2xl">
            The result? Relaxed, warmed-through feet, easier circulation, and a
            quiet fifteen minutes a basin at home just can&apos;t give you.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-full px-6 py-3 text-white font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--clay)" }}
          >
            Book your first visit — RM25
          </Link>
        </section>
      </main>
      <SiteFooter />
      </div>
    </>
  );
}
