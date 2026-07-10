import SignupForm from "./signup-form";
import Logo from "./logo";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
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
  );
}
