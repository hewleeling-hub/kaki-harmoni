"use client";

import { useEffect, useState } from "react";
import { whatsAppLink } from "@/lib/whatsapp";
import { customerRef } from "@/lib/customer";

type Voucher = {
  id: string;
  created_at: string;
  phone_normalised: string;
  price_myr: number;
  status: "reserved" | "paid" | "redeemed" | "cancelled";
  expires_on: string;
  paid_at: string | null;
  redeemed_at: string | null;
  voucher_no: string | null;
  notes: string | null;
  purchase_id: string | null;
  // Null when the signup was deleted — the voucher outlives it (ON DELETE SET NULL).
  signups: { name: string; phone: string | null } | null;
  purchases: { booking_date: string | null; booking_time: string | null } | null;
};

type Filter = "unpaid" | "paid" | "all";

const money = (n: number) => `RM${Number(n).toFixed(2)}`;

// "Today" and every date shown here are Kuala Lumpur's, not the viewer's or the server's.
const todayKL = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kuala_Lumpur" });

const fmtDay = (ymd: string) =>
  new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const STATUS_STYLE: Record<Voucher["status"], { bg: string; color: string; label: string }> = {
  reserved: { bg: "rgba(201,124,93,0.15)", color: "#8a4a30", label: "Unpaid" },
  paid: { bg: "rgba(46,125,123,0.12)", color: "var(--lagoon-dark)", label: "Paid" },
  redeemed: { bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.55)", label: "Redeemed" },
  cancelled: { bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.4)", label: "Cancelled" },
};

export default function VouchersClient() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("unpaid");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Walk-in sale form. Closed until asked for: most visits to this page are to
  // mark an online voucher paid, and an open form would push the list down.
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [wName, setWName] = useState("");
  const [wPhone, setWPhone] = useState("");
  const [wQty, setWQty] = useState(1);
  const [wMethod, setWMethod] = useState("cash");
  const [wSaving, setWSaving] = useState(false);
  const [wDone, setWDone] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/vouchers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load vouchers.");
      setVouchers(data.vouchers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load vouchers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setPaid(v: Voucher, status: "paid" | "reserved") {
    setBusyId(v.id);
    setError(null);
    try {
      const res = await fetch(`/api/vouchers/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not update the voucher.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update the voucher.");
    } finally {
      // Reload on success AND failure: a 409 means the row moved on, and the
      // list should show what it is now rather than what we thought.
      await load();
      setBusyId(null);
    }
  }

  async function recordWalkIn(e: React.FormEvent) {
    e.preventDefault();
    setWSaving(true);
    setError(null);
    setWDone(null);
    try {
      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: wName, phone: wPhone, quantity: wQty, payment_method: wMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not record the sale.");
      const c = data.customer;
      setWDone(
        `Recorded ${data.quantity} voucher${data.quantity === 1 ? "" : "s"} for ${c.name} (${customerRef(c.customer_no)}) — ${money(data.total)} paid. ${c.created ? "New customer added." : "Filed against their existing customer record."}`,
      );
      setWName("");
      setWPhone("");
      setWQty(1);
      setWMethod("cash");
      setWalkInOpen(false);
      await load();
    } catch (err) {
      // Kept open with what was typed, so a refusal (e.g. already at the limit)
      // can be read and fixed rather than retyped.
      setError(err instanceof Error ? err.message : "Could not record the sale.");
    } finally {
      setWSaving(false);
    }
  }

  if (loading) return <p className="text-black/50 text-sm">Loading vouchers…</p>;

  const today = todayKL();
  const live = vouchers.filter((v) => v.status !== "cancelled");
  const unpaid = live.filter((v) => v.status === "reserved");
  const paid = live.filter((v) => v.status === "paid" || v.status === "redeemed");
  const owed = unpaid.reduce((sum, v) => sum + Number(v.price_myr), 0);

  const shown =
    filter === "unpaid" ? unpaid : filter === "paid" ? paid : vouchers;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(201,124,93,0.12)", color: "#8a4a30" }}>
          {error}
        </div>
      )}

      {wDone && (
        <div className="rounded-lg px-4 py-3 text-sm bg-emerald-50 text-emerald-900 border border-emerald-200">{wDone}</div>
      )}

      {!walkInOpen ? (
        <button
          onClick={() => {
            setWalkInOpen(true);
            setWDone(null);
          }}
          className="text-sm font-semibold px-4 py-2 rounded-full text-white"
          style={{ backgroundColor: "var(--lagoon-dark)" }}
        >
          Record a walk-in sale
        </button>
      ) : (
        <form onSubmit={recordWalkIn} className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5 space-y-3">
          <p className="text-sm font-medium">Walk-in voucher sale — already paid at the counter</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="block mb-1 text-black/60">Name</span>
              <input
                required
                value={wName}
                onChange={(e) => setWName(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="block mb-1 text-black/60">Phone</span>
              <input
                required
                inputMode="tel"
                value={wPhone}
                onChange={(e) => setWPhone(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="block mb-1 text-black/60">How many vouchers</span>
              <select
                value={wQty}
                onChange={(e) => setWQty(Number(e.target.value))}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm bg-white"
              >
                <option value={1}>1 voucher</option>
                <option value={2}>2 vouchers</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="block mb-1 text-black/60">Paid by</span>
              <select
                value={wMethod}
                onChange={(e) => setWMethod(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm bg-white"
              >
                <option value="cash">Cash</option>
                <option value="duitnow">DuitNow / e-wallet</option>
                <option value="card">Card</option>
              </select>
            </label>
          </div>
          <p className="text-xs text-black/50">
            Counts toward the two-per-person limit on this phone number, and is redeemable until 31 December 2026.
          </p>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setWalkInOpen(false)} className="text-sm px-4 py-2 rounded-lg text-black/50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={wSaving}
              className="text-sm font-semibold px-4 py-2 rounded-full text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--lagoon)" }}
            >
              {wSaving ? "Recording…" : "Record sale"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Metric label="Claimed" value={String(live.length)} />
        <Metric label="Unpaid" value={String(unpaid.length)} accent="#8a4a30" />
        <Metric label="Paid" value={String(paid.length)} />
        <Metric label="Still to collect" value={money(owed)} accent="#8a4a30" />
      </div>

      <div className="flex gap-2">
        {(["unpaid", "paid", "all"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-sm font-medium px-4 py-1.5 rounded-full border border-black/10 capitalize"
            style={filter === f ? { background: "var(--lagoon)", color: "white", borderColor: "transparent" } : undefined}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/70 overflow-hidden">
        {shown.length === 0 ? (
          <p className="px-6 py-6 text-black/50 text-sm">
            {filter === "unpaid" ? "Nothing waiting for payment." : "No vouchers here yet."}
          </p>
        ) : (
          <ul className="divide-y divide-black/5">
            {shown.map((v) => {
              const st = STATUS_STYLE[v.status];
              const phone = v.signups?.phone ?? null;
              const expired = v.expires_on < today;
              const slot =
                v.purchases?.booking_date
                  ? `Booked ${fmtDay(v.purchases.booking_date)}${v.purchases.booking_time ? ` · ${v.purchases.booking_time.slice(0, 5)}` : ""}`
                  : "No slot yet";
              return (
                <li key={v.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-medium" style={{ color: "var(--ink)" }}>
                      {v.signups?.name ?? "Deleted signup"}
                    </p>
                    <p className="text-sm text-black/50">
                      {phone ?? `+${v.phone_normalised}`} · {money(v.price_myr)} · claimed {fmtDate(v.created_at)}
                    </p>
                    <p className="text-sm text-black/50">
                      {slot} · redeem by {fmtDay(v.expires_on)}
                      {expired && v.status !== "redeemed" && (
                        <span className="font-semibold" style={{ color: "#8a4a30" }}> (expired)</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                  {phone && (
                    <a
                      href={whatsAppLink(phone, "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5"
                    >
                      WhatsApp
                    </a>
                  )}
                  {v.status === "reserved" && (
                    <button
                      onClick={() => setPaid(v, "paid")}
                      disabled={busyId === v.id}
                      className="text-sm font-semibold px-4 py-2 rounded-full text-white disabled:opacity-50"
                      style={{ backgroundColor: "var(--lagoon)" }}
                    >
                      {busyId === v.id ? "Saving…" : "Mark paid"}
                    </button>
                  )}
                  {v.status === "paid" && (
                    <button
                      onClick={() => setPaid(v, "reserved")}
                      disabled={busyId === v.id}
                      className="text-sm px-3 py-1.5 rounded-lg text-black/50 hover:bg-black/5 disabled:opacity-50"
                    >
                      {busyId === v.id ? "Saving…" : "Undo paid"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.7)" }}>
      <p className="text-xs text-black/50">{label}</p>
      <p className="text-2xl font-semibold mt-1" style={{ color: accent ?? "var(--lagoon-dark)" }}>
        {value}
      </p>
    </div>
  );
}
