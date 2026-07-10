"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { whatsAppLink } from "@/lib/whatsapp";

const PAYMENT_METHODS = [
  { value: "online_transfer", label: "Online transfer" },
  { value: "cash", label: "Cash on arrival" },
  { value: "card", label: "Card" },
];

export default function PurchaseForm({
  signupId,
  signupName,
  signupPhone,
}: {
  signupId: string;
  signupName: string;
  signupPhone: string;
}) {
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
        <a
          href={whatsAppLink(
            signupPhone,
            `Hi Kaki Harmoni! This is ${signupName}. I signed up for the RM25 first-visit offer but need a bit more time before purchasing — please remind me!`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-lg px-4 py-2.5 font-medium text-white"
          style={{ background: "#25D366" }}
        >
          <WhatsAppIcon />
          Remind me on WhatsApp instead
        </a>
      </p>
      <p className="text-xs text-center text-black/45">
        No rush — we&apos;ll hold your spot at the RM25 first-visit price for 48 hours.
      </p>
      <p className="text-center">
        <Link href="/" className="text-sm text-black/45 hover:text-black/65 underline underline-offset-2">
          No thanks, maybe another time
        </Link>
      </p>
    </form>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.13c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.11.11-1.79-.11a16.5 16.5 0 0 1-1.65-.62c-2.9-1.25-4.8-4.16-4.94-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.26-.29.58-.36.77-.36.19 0 .39 0 .55.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.37-.44.5-.15.14-.3.3-.13.59.17.29.76 1.26 1.64 2.04 1.13 1.01 2.08 1.32 2.37 1.47.29.15.46.13.63-.08.17-.2.72-.84.92-1.13.19-.29.39-.24.65-.14.27.1 1.68.79 1.97.94.29.14.48.21.55.33.07.12.07.7-.17 1.38Z" />
    </svg>
  );
}
