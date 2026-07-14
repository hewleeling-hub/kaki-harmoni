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
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="uppercase tracking-widest text-xs font-semibold" style={{ color: "var(--clay)" }}>
          About us
        </p>
        <h1
          className="font-display text-4xl md:text-5xl font-semibold leading-tight mt-3"
          style={{ color: "var(--lagoon-dark)" }}
        >
          A little ritual for tired feet — and busy minds.
        </h1>

        <div className="mt-8 space-y-6 text-lg leading-relaxed text-black/75">
          <p>
            Kaki Harmoni began with a simple observation: we spend all day on our
            feet, yet almost never give them a moment&apos;s care. So we built a place to
            do exactly that — a warm foot hydrotherapy soak paired with a good cup
            of coffee, tucked right into the clubhouse at Desa Cindaimas.
          </p>
          <p>
            The idea is small on purpose. You don&apos;t need to block out an afternoon or
            book a spa day. Fifteen minutes with your feet in warm, bubbling water,
            a drink in hand, and the noise of the day quietly fades. People arrive
            carrying their morning and leave a whole lot lighter.
          </p>
          <p>
            <span className="font-display italic" style={{ color: "var(--lagoon)" }}>
              &ldquo;Kaki&rdquo;
            </span>{" "}
            means feet — and, in Malaysian, a good companion. That&apos;s the feeling
            we&apos;re after: somewhere you come to unwind on your own, or to reconnect
            with a friend over something calm and unhurried. Four hydrotherapy
            stations, a rotating pour of fresh coffee, and no rush to be anywhere.
          </p>
          <p>
            Whether it&apos;s a standing appointment after work or a spontaneous treat on
            a slow afternoon, we&apos;d love to have you. Relax, refresh, reconnect — that&apos;s
            the whole idea.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
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
    </>
  );
}
