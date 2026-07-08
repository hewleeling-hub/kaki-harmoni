import Link from "next/link";

export default function ConfirmationNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-sm border border-black/5 p-8 text-center space-y-4">
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          Signup not found
        </h1>
        <p className="text-black/70">We couldn&apos;t find that signup.</p>
        <Link href="/" className="inline-block rounded-lg px-4 py-2.5 font-medium text-white" style={{ background: "var(--lagoon)" }}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
