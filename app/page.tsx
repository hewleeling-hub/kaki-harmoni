import SignupForm from "./signup-form";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <div className="font-display text-2xl italic font-semibold">
            <span style={{ color: "var(--lagoon)" }}>Kaki</span>{" "}
            <span style={{ color: "var(--clay)" }}>Harmoni</span>
          </div>
          <p className="uppercase tracking-widest text-xs font-medium" style={{ color: "var(--clay)" }}>
            Desa Cindaimas Clubhouse
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight" style={{ color: "var(--lagoon-dark)" }}>
            Twenty minutes. A whole lot lighter.
          </h1>
          <p className="text-black/70 max-w-md">
            Reserve your spot at Kaki Harmoni — foot hydrotherapy and a slow coffee,
            in the same twenty minutes. Sign up below and we&apos;ll hold your place.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
