import Link from "next/link";
import Logo from "@/app/logo";

export default function PurchaseSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-sm border border-black/5 p-8 text-center space-y-4">
        <Logo size="sm" />
        <div
          className="mx-auto h-12 w-12 rounded-full flex items-center justify-center text-white text-xl"
          style={{ background: "var(--clay)" }}
        >
          ✓
        </div>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          Purchase confirmed!
        </h1>
        <p className="text-black/70">Thanks — we&apos;ll see you at Kaki Harmoni soon.</p>
        <Link href="/" className="inline-block rounded-lg px-4 py-2.5 font-medium text-white" style={{ background: "var(--lagoon)" }}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
