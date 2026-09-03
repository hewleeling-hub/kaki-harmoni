"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { whatsAppLink, BUSINESS_WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { PRELAUNCH_MODE, DOOR_SURCHARGE_MYR, PREPAY_PRICE_MYR } from "@/lib/config";
import { withOption, PACKAGES_ARE_PREPAY_ONLY } from "@/config/catalogue";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price_myr: number;
  category: string;
};

type PayTiming = "prepay" | "door";

const money = (n: number) => `RM${n.toFixed(2)}`;

/** Services and packages are the thing being bought; add-ons ride along. */
const isMainItem = (p: Product) => p.category === "service" || p.category === "package";

export default function PurchaseForm({
  signupId,
  signupName,
  products,
  slotDate = null,
  slotTime = null,
  preselectedProductId = null,
  option = null,
  isReturning = false,
}: {
  signupId: string;
  signupName: string;
  signupPhone: string;
  products: Product[];
  /** Chosen on the previous step; saved with the purchase that confirms it. */
  slotDate?: string | null;
  slotTime?: string | null;
  /** Catalogue row matching the tier clicked on /prices, already validated. */
  preselectedProductId?: string | null;
  /** The raw slug, kept so a bounce back to the calendar doesn't lose it. */
  option?: string | null;
  /** This phone has booked before, so the first-visit price isn't on offer. */
  isReturning?: boolean;
}) {
  const router = useRouter();

  // Add-ons are deliberately not sold here — an extra fifteen minutes or a
  // second coffee is a decision made in the chair, and the shop handles it in
  // person. The filter stays so a reactivated add-on row could never sneak
  // into this list as if it were a bookable visit.
  const mainItems = useMemo(() => products.filter(isMainItem), [products]);

  // One visit, one main item. The FAQ is explicit that a Double Reset is two
  // soaks for ONE person and that a pair should "book a soak each", so a
  // quantity stepper here would both contradict the copy and overbook the slot
  // — capacity is counted per booking, not per head.
  const [selectedId, setSelectedId] = useState<string | null>(
    preselectedProductId ?? mainItems[0]?.id ?? null,
  );
  const [payTiming, setPayTiming] = useState<PayTiming>("prepay");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = mainItems.find((p) => p.id === selectedId) ?? null;
  const hasCatalogue = mainItems.length > 0;

  // Packages may be settled on arrival like a single visit — see
  // PACKAGES_ARE_PREPAY_ONLY, which is the one switch governing this and the
  // matching server-side rule.
  const isPackage = selected?.category === "package";
  const prepayOnly = PACKAGES_ARE_PREPAY_ONLY && isPackage;
  const effectiveTiming: PayTiming = prepayOnly ? "prepay" : payTiming;

  const subtotal = selected ? Number(selected.price_myr) : 0;

  const surcharge = effectiveTiming === "door" ? DOOR_SURCHARGE_MYR : 0;
  const total = Math.round((subtotal + surcharge) * 100) / 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (hasCatalogue && !selected) {
      setError("Please choose what you'd like to book.");
      return;
    }

    const items = selected ? [{ product_id: selected.id, quantity: 1 }] : [];

    setSubmitting(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signup_id: signupId,
          pay_timing: effectiveTiming,
          payment_method: effectiveTiming === "prepay" ? "ewallet" : "cash",
          items,
          slot_date: slotDate,
          slot_time: slotTime,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Someone else took the last place while this checkout was open. Send
        // them back to choose again rather than leaving them stuck on a dead
        // payment screen — nothing was charged, and their option comes along.
        if (data.slot_taken) {
          router.push(withOption(`/purchase/${signupId}/book?taken=1`, option));
          return;
        }
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      // The slot was chosen first and saved with this purchase, so payment is
      // the last step for everyone now.
      router.push(`/purchase/${signupId}/success`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  // Two clear cards rather than a compact list: this is the one real decision
  // on the page. Prepay is visually preferred, but paying at the door is a
  // proper booking too and must not read as a penalty.
  //
  // These cards deliberately do NOT restate the item price — it is already on
  // the card above, and repeating it made the same RM25.00 appear twice in a
  // row as though it were two charges. Only the difference between the two
  // ways of paying belongs here; the total is stated once, at the bottom.
  const timingOption = (value: PayTiming, title: string, extra: number, note: string, recommended?: boolean) => {
    const active = payTiming === value;
    return (
      <button
        type="button"
        onClick={() => setPayTiming(value)}
        aria-pressed={active}
        className="w-full min-h-[76px] text-left rounded-xl border-2 px-4 py-3 transition"
        style={{
          borderColor: active ? "var(--lagoon)" : "rgba(0,0,0,0.12)",
          background: active ? "rgba(46,125,123,0.07)" : "white",
        }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold">{title}</span>
          {extra > 0 && (
            <span className="font-display text-lg font-bold whitespace-nowrap" style={{ color: "var(--clay)" }}>
              +{money(extra)}
            </span>
          )}
        </div>
        {recommended && (
          <span
            className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: "var(--clay)", color: "white" }}
          >
            Best value
          </span>
        )}
        <p className="mt-1 text-xs text-black/55">{note}</p>
      </button>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* ── What are you booking? ─────────────────────────────────────── */}
      {/* Say why the RM25 option isn't here. Removing it silently left people
          wondering whether the site was broken or the price had gone up —
          worse than the answer, which is simply that they've had it. Warm, not
          a telling-off: they are a returning customer, which is the point. */}
      {isReturning && (
        <div
          className="rounded-xl border px-4 py-3"
          style={{ borderColor: "rgba(46,125,123,0.35)", background: "rgba(46,125,123,0.07)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            Welcome back — you&apos;ve already had your first soak with us.
          </p>
          <p className="mt-1 text-xs text-black/60">
            The RM{PREPAY_PRICE_MYR} first-visit price is a one-off for new guests, so it isn&apos;t
            shown below. Everything else is open to you as usual.
          </p>
        </div>
      )}

      <fieldset>
        <legend className="block text-sm font-medium mb-1.5">What would you like to book?</legend>
        {hasCatalogue ? (
          <div className="grid gap-2">
            {mainItems.map((p) => {
              const active = selectedId === p.id;
              return (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3 transition"
                  style={{
                    borderColor: active ? "var(--lagoon)" : "rgba(0,0,0,0.12)",
                    background: active ? "rgba(46,125,123,0.07)" : "white",
                  }}
                >
                  <input
                    type="radio"
                    name="main-item"
                    value={p.id}
                    checked={active}
                    onChange={() => setSelectedId(p.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--lagoon)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-black/80">{p.name}</span>
                      <span
                        className="font-display text-lg font-bold whitespace-nowrap"
                        style={{ color: "var(--lagoon-dark)" }}
                      >
                        {money(Number(p.price_myr))}
                      </span>
                    </span>
                    {p.description && (
                      <span className="mt-0.5 block text-xs text-black/50">{p.description}</span>
                    )}
                    {PACKAGES_ARE_PREPAY_ONLY && p.category === "package" && (
                      <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider text-black/45">
                        Prepay only
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="w-full rounded-lg border border-black/10 bg-black/5 px-3 py-2.5">
            <p className="text-black/80 text-sm font-medium">First Visit — Foot Soak + Coffee</p>
          </div>
        )}
        {isPackage && (
          <p className="mt-2 text-xs text-black/55">
            You&apos;re booking the first visit today; the rest are yours to arrange whenever
            suits — just message us or ask at the counter.
          </p>
        )}
      </fieldset>

      {/* ── How to pay ────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium mb-1.5">How would you like to pay?</label>
        {prepayOnly ? (
          /* Not a hidden rule: say plainly why there is no choice here, so the
             missing "pay at the door" card doesn't look like a broken page. */
          <div className="rounded-xl border-2 px-4 py-3" style={{ borderColor: "var(--lagoon)", background: "rgba(46,125,123,0.07)" }}>
            <span className="text-sm font-semibold">Prepay</span>
            <p className="mt-1 text-xs text-black/55">
              Packages are prepaid so your visits are credited to you from the start. Single
              visits can still be paid at the door.
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {timingOption("prepay", "Prepay", 0, "Secures your slot at the launch rate — no extra charge.", true)}
            {timingOption("door", "Pay at the door", DOOR_SURCHARGE_MYR, "Prefer to pay when you arrive? No problem.")}
          </div>
        )}
        {effectiveTiming === "prepay" && (
          <p className="text-xs mt-2 rounded-lg px-3 py-2" style={{ background: "rgba(46,125,123,0.08)", color: "var(--lagoon-dark)" }}>
            Your spot is only locked once payment is received — we&apos;ll show you a
            DuitNow QR to scan on the next step. Fully refundable until your slot is confirmed.
          </p>
        )}
      </div>

      {/* ── Total ─────────────────────────────────────────────────────── *
       * Only shown when the total isn't simply the price already on the card
       * above — i.e. when the door surcharge is being added. Now that add-ons
       * are gone, a prepay order would otherwise repeat the same figure as a
       * line and again as a "Total", with the button below making three. */}
      {selected && surcharge > 0 && (
        <div className="rounded-lg bg-black/5 px-4 py-3 text-sm space-y-1">
          <div className="flex justify-between gap-2 text-black/70">
            <span className="min-w-0 truncate">{selected.name}</span>
            <span className="tabular-nums">{money(Number(selected.price_myr))}</span>
          </div>
          <div className="flex justify-between gap-2 text-black/70">
            <span>Pay-at-the-door</span>
            <span className="tabular-nums">{money(surcharge)}</span>
          </div>
          <div className="flex justify-between gap-2 border-t border-black/10 pt-1.5 font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            <span>Total</span>
            <span className="tabular-nums">{money(total)}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg px-4 py-2.5 font-medium text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ background: "var(--clay)" }}
      >
        {submitting && <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
        {submitting
          ? "Confirming…"
          : PRELAUNCH_MODE
          ? `Reserve my spot — ${money(total)}`
          : `Confirm — ${money(total)}`}
      </button>

      <p className="text-center">
        <a
          href={whatsAppLink(
            BUSINESS_WHATSAPP_NUMBER,
            `Hi Kaki Harmoni! This is ${signupName}. I signed up but need a bit more time before reserving — please remind me!`,
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
