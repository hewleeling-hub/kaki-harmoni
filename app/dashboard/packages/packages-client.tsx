"use client";

import { useEffect, useState } from "react";
import { customerRef } from "@/lib/customer";
import type { VoucherCustomer } from "@/lib/voucher-customers";

type Pkg = { id: string; name: string; price: number; visits: number };
type Sale = {
  id: string;
  created_at: string;
  product_name: string;
  amount_myr: number | string;
  payment_method: string | null;
  package_visits: number;
  package_expires_on: string | null;
  visit_dates: string[];
  signups: { name: string | null; phone: string | null; customer_no: number | null } | null;
};

const todayKL = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
const money = (n: number | string) => `RM${Number(n).toFixed(2)}`;
const fmtDay = (ymd: string) =>
  new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const input = "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm";

export default function PackagesClient({ customers, packages }: { customers: VoucherCustomer[]; packages: Pkg[] }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [productId, setProductId] = useState(packages[0]?.id ?? "");
  const [discount, setDiscount] = useState("0");
  const [method, setMethod] = useState("duitnow");
  const [soldOn, setSoldOn] = useState(todayKL());
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load packages.");
      setSales(data.packages ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load packages.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const chosen = packages.find((p) => p.id === productId);
  const pct = Number(discount);
  const total = chosen && Number.isFinite(pct) ? Math.round(chosen.price * (1 - pct / 100) * 100) / 100 : null;

  async function sell(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, product_id: productId, discount_pct: pct, payment_method: method, sold_on: soldOn }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not record the sale.");
      setDone(`Recorded ${chosen?.name} for ${data.customer.name} (${customerRef(data.customer.customer_no)}) — ${money(data.total)}. Valid until ${fmtDay(data.expires_on)}.`);
      setName("");
      setPhone("");
      setQuery("");
      setDiscount("0");
      setSoldOn(todayKL());
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record the sale.");
    } finally {
      setSaving(false);
    }
  }

  async function recordVisit(s: Sale) {
    if (!window.confirm(`Record a visit for ${s.signups?.name ?? "this customer"}, dated today?`)) return;
    setBusyId(s.id);
    setError(null);
    setDone(null);
    try {
      const res = await fetch(`/api/packages/${s.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not record the visit.");
      setDone(`Visit ${data.used} of ${data.of} recorded for ${s.signups?.name ?? "the customer"}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record the visit.");
    } finally {
      await load();
      setBusyId(null);
    }
  }

  const matches = query.trim()
    ? customers
        .filter((c) => [c.name ?? "", c.phone ?? "", customerRef(c.customer_no)].join(" ").toLowerCase().includes(query.trim().toLowerCase()))
        .slice(0, 8)
    : [];
  const today = todayKL();

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(201,124,93,0.12)", color: "#8a4a30" }}>
          {error}
        </div>
      )}
      {done && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(46,125,123,0.12)", color: "var(--lagoon-dark)" }}>
          {done}
        </div>
      )}

      <div className="rounded-2xl border border-black/5 bg-white/70 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-medium">Sell a package</p>
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-sm font-semibold px-4 py-2 rounded-full text-white"
            style={{ backgroundColor: "var(--lagoon)" }}
          >
            {open ? "Close" : "Sell package"}
          </button>
        </div>

        {open && (
          <form onSubmit={sell} className="space-y-3">
            <div className="relative">
              <label className="text-sm">
                <span className="block mb-1 text-black/60">Pick an existing customer</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, number or KH number" className={input} />
              </label>
              {matches.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-black/10 bg-white shadow-md">
                  {matches.map((c) => (
                    <li key={c.customer_no}>
                      <button
                        type="button"
                        onClick={() => {
                          setName(c.name ?? "");
                          setPhone(c.phone ?? "");
                          setQuery("");
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-black/5"
                      >
                        <span className="w-12 shrink-0 text-xs text-black/40">{customerRef(c.customer_no)}</span>
                        <span className="min-w-0 flex-1 truncate font-medium">{c.name ?? "—"}</span>
                        <span className="text-xs text-black/50">{c.phone}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="block mb-1 text-black/60">Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} required className={input} />
              </label>
              <label className="text-sm">
                <span className="block mb-1 text-black/60">Phone</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" className={input} />
              </label>
              <label className="text-sm">
                <span className="block mb-1 text-black/60">Package</span>
                <select value={productId} onChange={(e) => setProductId(e.target.value)} className={input}>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {money(p.price)} · {p.visits} visits
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="block mb-1 text-black/60">Discount %</span>
                <input type="number" min={0} max={100} step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} className={input} />
              </label>
              <label className="text-sm">
                <span className="block mb-1 text-black/60">Paid by</span>
                <select value={method} onChange={(e) => setMethod(e.target.value)} className={input}>
                  <option value="duitnow">E-wallet / DuitNow</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="block mb-1 text-black/60">Date they paid</span>
                <input type="date" value={soldOn} max={todayKL()} onChange={(e) => setSoldOn(e.target.value)} className={input} />
              </label>
            </div>

            {total !== null && (
              <p className="text-sm text-black/60">
                Total <b>{money(total)}</b>
                {pct > 0 && chosen ? ` (${money(chosen.price)} less ${pct}%)` : ""} · {chosen?.visits} visits, valid 6 months from the day paid.
              </p>
            )}
            <button
              type="submit"
              disabled={saving || !name.trim() || !phone.trim() || !chosen}
              className="text-sm font-semibold px-5 py-2 rounded-full text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--lagoon-dark)" }}
            >
              {saving ? "Recording…" : "Record sale"}
            </button>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/70 overflow-hidden">
        {loading ? (
          <p className="px-6 py-6 text-sm text-black/50">Loading…</p>
        ) : sales.length === 0 ? (
          <p className="px-6 py-6 text-sm text-black/50">No packages sold yet.</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {sales.map((s) => {
              const used = s.visit_dates.length;
              const left = s.package_visits - used;
              const expired = !!s.package_expires_on && s.package_expires_on < today;
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                  <div className="flex-1 min-w-[220px]">
                    <p className="font-medium" style={{ color: "var(--ink)" }}>
                      {s.signups?.name ?? "Deleted customer"}{" "}
                      {s.signups?.customer_no != null && <span className="text-xs text-black/40">{customerRef(s.signups.customer_no)}</span>}
                    </p>
                    <p className="text-sm text-black/50">
                      {s.product_name} · {money(s.amount_myr)} · paid {fmtDay(s.created_at.slice(0, 10))}
                    </p>
                    <p className="text-sm text-black/50">
                      {used} of {s.package_visits} used
                      {used > 0 && ` (${s.visit_dates.map((d) => fmtDay(d).replace(/ \d{4}$/, "")).join(", ")})`}
                      {s.package_expires_on && ` · valid until ${fmtDay(s.package_expires_on)}`}
                      {expired && left > 0 && <span className="font-semibold" style={{ color: "#8a4a30" }}> (expired)</span>}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/5">
                    {left > 0 ? `${left} left` : "All used"}
                  </span>
                  <button
                    onClick={() => recordVisit(s)}
                    disabled={busyId === s.id || left <= 0 || expired}
                    className="text-sm font-semibold px-4 py-2 rounded-full text-white disabled:opacity-40"
                    style={{ backgroundColor: "var(--lagoon)" }}
                  >
                    {busyId === s.id ? "Saving…" : "Use a visit"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
