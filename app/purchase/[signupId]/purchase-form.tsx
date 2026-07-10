"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PAYMENT_METHODS = [
  { value: "online_transfer", label: "Online transfer" },
  { value: "cash", label: "Cash on arrival" },
  { value: "card", label: "Card" },
];

export default function PurchaseForm({ signupId }: { signupId: string }) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("online_transfer");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signup_id: signupId, payment_method: paymentMethod }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/purchase/${signupId}/success`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Your order</label>
        <div className="w-full rounded-lg border border-black/10 bg-black/5 px-3 py-2.5">
          <p className="text-black/80 text-sm font-medium">First Visit — Foot Soak + Coffee</p>
          <p className="text-black/50 text-xs mt-0.5">
            <span className="font-semibold" style={{ color: "var(--clay)" }}>RM25.00</span>{" "}
            <span className="line-through">RM40.00</span> — first-visit price
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="payment" className="block text-sm font-medium mb-1">
          Payment method
        </label>
        <select
          id="payment"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 focus:outline-none focus:ring-2"
          style={{ ["--tw-ring-color" as string]: "var(--lagoon)" }}
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg px-4 py-2.5 font-medium text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: "var(--clay)" }}
      >
        {submitting && (
          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        )}
        {submitting ? "Confirming…" : "Confirm purchase"}
      </button>

      <p className="text-center">
        <Link href="/" className="text-sm text-black/50 hover:text-black/70 underline underline-offset-2">
          Not right now — I&apos;ll decide later
        </Link>
      </p>
    </form>
  );
}
