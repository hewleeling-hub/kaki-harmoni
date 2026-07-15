import SignupForm from "./signup-form";
import Logo from "./logo";
import SiteNav from "./site-nav";
import SiteFooter from "./site-footer";

export default function Home() {
  return (
    <>
      <SiteNav />
      <div className="md:pl-60">
      <main className="flex items-center justify-center p-6 py-16 md:py-24">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lotti.png"
            alt="Lotti, the Kaki Harmoni lotus mascot, soaking her feet with a coffee"
            className="w-44 h-44 md:w-52 md:h-52 object-contain -mb-2"
          />
          <Logo />
          <p className="uppercase tracking-widest text-xs font-medium" style={{ color: "var(--clay)" }}>
            @ Desa Cindaimas Condominium Clubhouse
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight" style={{ color: "var(--lagoon-dark)" }}>
            Fifteen minutes. A whole lot lighter.
          </h1>
          <p className="text-black/70 max-w-md">
            Foot soak + coffee, together for RM25 — your first visit at Kaki Harmoni
            (normal price RM40). Sign up and we&apos;ll hold your place.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
          <SignupForm />
        </div>
      </div>
      </main>
      <SiteFooter />
      </div>
    </>
  );
}
