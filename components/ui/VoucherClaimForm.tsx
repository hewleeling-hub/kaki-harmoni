"use client";

import { useState } from "react";
import { whatsappLink } from "@/config/business";
import type { VoucherOffer } from "@/config/promotions";

/**
 * Claiming 11.11 vouchers.
 *
 * Takes a mobile number because that is what the per-person cap is counted on
 * (lib/vouchers.ts). The form shows what the server decided rather than
 * guessing: the cap is re-checked server-side on submit, so a stale tab or a
 * second device cannot talk its way past it.
 *
 * This RESERVES; it does not take payment. Money still changes hands on
 * WhatsApp or at the counter, which is where it happens today.
 */
type Result = {
  claimed: number;
  held: number;
  remaining: number;
  redeem_by: string;
};

export function VoucherClaimForm({ offer }: { offer: VoucherOffer }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Result | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(data as Result);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-[18px] border border-olive/30 bg-ivory/80 p-5">
        <p className="text-[18px] font-semibold text-olive-dark">
          {done.claimed === 1 ? "One voucher is yours" : `${done.claimed} vouchers are yours`} — RM
          {11 * done.claimed} in total.
        </p>
        <p className="mt-2 text-[16px] leading-relaxed text-brown">
          We&rsquo;ve put {done.claimed === 1 ? "it" : "them"} against your number. Settle up on
          WhatsApp or at the counter, and soak any time before {done.redeem_by}.
        </p>
        {done.remaining > 0 && (
          <p className="mt-2 text-[15px] text-muted">
            You can still take {done.remaining} more on this number.
          </p>
        )}
        <a
          href={whatsappLink(
            `Hi Kaki Harmoni! I've reserved ${done.claimed} 11.11 Foot Spa Voucher${done.claimed === 1 ? "" : "s"} (${name}, ${phone}). How would you like me to pay?`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-[26px] bg-[#7a5410] px-6 text-[17px] font-semibold text-[#FBEFD6] transition hover:brightness-110"
        >
          Pay on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[18px] border border-gold/40 bg-ivory/70 p-5">
      <p className="text-[16px] font-semibold text-olive-dark">
        Reserve yours — {offer.maxPerPerson} per person
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[15px] font-medium text-brown">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="mt-1 min-h-12 w-full rounded-[14px] border border-line bg-ivory px-4 text-[16px] text-brown outline-none focus:border-olive"
          />
        </label>
        <label className="block">
          <span className="text-[15px] font-medium text-brown">Mobile number</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="012-345 6789"
            className="mt-1 min-h-12 w-full rounded-[14px] border border-line bg-ivory px-4 text-[16px] text-brown outline-none focus:border-olive"
          />
        </label>
      </div>

      <fieldset className="mt-3">
        <legend className="text-[15px] font-medium text-brown">How many?</legend>
        <div className="mt-1.5 flex gap-2">
          {Array.from({ length: offer.maxPerPerson }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setQuantity(n)}
              aria-pressed={quantity === n}
              className={`min-h-12 min-w-[76px] rounded-[14px] border px-4 text-[16px] font-semibold transition ${
                quantity === n
                  ? "border-[#7a5410] bg-[#7a5410] text-[#FBEFD6]"
                  : "border-line bg-ivory text-brown hover:border-olive"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="mt-3 rounded-[14px] bg-[#f8e4e0] px-4 py-3 text-[15px] text-[#8a3524]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-[26px] bg-[#7a5410] px-6 text-[17px] font-semibold text-[#FBEFD6] transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Just a moment…" : `Reserve for RM${11 * quantity}`}
      </button>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        No payment now — settle on WhatsApp or at the counter.
      </p>
    </form>
  );
}
