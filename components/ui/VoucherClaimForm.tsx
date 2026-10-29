"use client";

import { useState } from "react";
import { whatsappLink } from "@/config/business";
import { PAYMENT_QR } from "@/lib/config";
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
  reference: string;
  amount_myr: number;
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
    const amount = `RM${done.amount_myr}`;
    return (
      <div className="rounded-[18px] border border-olive/30 bg-ivory/80 p-5">
        <p className="text-[18px] font-semibold text-olive-dark">
          {done.claimed === 1 ? "One voucher reserved" : `${done.claimed} vouchers reserved`} — {amount} to pay.
        </p>
        <p className="mt-1 text-[15px] text-muted">
          Reference <span className="font-semibold text-brown">{done.reference}</span> — quote it if
          you message us.
        </p>

        {/* Paying is the step that actually completes this, so the QR is shown
            here rather than linked to: a customer who has to go and find it
            is a customer who pays later, or not at all. Same DuitNow code the
            booking flow uses. */}
        <div className="mt-4 rounded-[14px] bg-cream/60 p-4 text-center">
          <p className="text-[16px] font-semibold text-olive-dark">Scan to pay {amount} · DuitNow</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PAYMENT_QR}
            alt={`DuitNow QR code to pay ${amount} to Kaki Harmoni`}
            className="mx-auto mt-3 w-52 rounded-[12px] bg-white"
          />
          <p className="mt-3 text-[15px] leading-relaxed text-brown">
            Open any bank or e-wallet app, scan, and pay {amount}.
          </p>
          {/* A DuitNow transfer arrives with whatever the sender's bank chose
              to put on it, which is often a bank reference and nothing else.
              Two steps make it matchable: the name in the reference field, and
              the screenshot. Numbered, because both have to happen and a
              sentence running them together gets half-read. */}
          <ol className="mt-3 space-y-1.5 text-left text-[15px] leading-relaxed text-brown">
            <li className="flex gap-2">
              <span className="font-semibold text-[#7a5410]">1.</span>
              <span>
                Put <strong className="text-olive-dark">your full name</strong> in the reference or
                recipient reference box, so we can match the payment to you.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-[#7a5410]">2.</span>
              <span>
                <strong className="text-olive-dark">Send us a screenshot</strong> of the payment on
                WhatsApp — tap the button below and attach it.
              </span>
            </li>
          </ol>
        </div>

        <a
          href={whatsappLink(
            `Hi Kaki Harmoni! I've paid ${amount} for ${done.claimed} 11.11 Foot Spa Voucher${done.claimed === 1 ? "" : "s"}. Full name: ${name}. Reference ${done.reference} (${phone}). Screenshot of my payment is attached.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-[26px] bg-[#25D366] px-6 text-[17px] font-semibold text-white transition hover:brightness-95"
        >
          I&rsquo;ve paid — send screenshot
        </a>

        {/* The step that was missing. Paying used to be the end of the screen,
            which left somebody holding a voucher and no idea that a time still
            had to be picked. Checkout recognises the voucher by their number
            and books it at no further charge. */}
        <a
          href="/#reserve"
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-[26px] border border-olive bg-ivory px-6 text-[17px] font-semibold text-olive-dark transition hover:bg-beige/50"
        >
          Now pick your time →
        </a>

        <p className="mt-3 text-[15px] leading-relaxed text-brown">
          We&rsquo;ll confirm once it lands. Then soak any time before {done.redeem_by}.
          {done.remaining > 0 && ` You can still take ${done.remaining} more on this number.`}
        </p>
        {/* Reserving does not hold the price. An unpaid reservation found at
            the counter in December is an argument about RM11 vs RM30, so the
            deadline is said here rather than left to the terms above. */}
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Rather pay in person? Mention your name at the counter — but it must be paid by{" "}
          <strong className="text-brown">{offer.sellUntilLabel}</strong> for the {offer.price} price
          to stand.
        </p>
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
        Reserve here and pay by QR on the next step, or at the counter — either way, payment
        must reach us by {offer.sellUntilLabel} for the {offer.price} price to stand.
      </p>
    </form>
  );
}
