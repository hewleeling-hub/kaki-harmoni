"use client";

import { useEffect, useState } from "react";
import { whatsAppLink } from "@/lib/whatsapp";
import { draftWinBack } from "@/lib/followup";

type Status = "prospect" | "new" | "returning" | "lapsed";

type Customer = {
  signup_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  visit_count: number;
  total_spend_myr: number;
  last_purchase_at: string | null;
  days_since_last_visit: number | null;
  retention_status: Status;
};

type Summary = {
  customers: number;
  returning: number;
  newCustomers: number;
  lapsed: number;
  repeatRate: number;
  totalSpend: number;
};

type Product = { id: string; name: string; price_myr: number; active: boolean };

const money = (n: number) => `RM${Number(n).toFixed(2)}`;

const STATUS_STYLE: Record<Status, { bg: string; color: string; label: string }> = {
  returning: { bg: "rgba(46,125,123,0.12)", color: "var(--lagoon-dark)", label: "Returning" },
  new: { bg: "rgba(168,213,208,0.35)", color: "var(--lagoon-dark)", label: "New" },
  lapsed: { bg: "rgba(201,124,93,0.15)", color: "#8a4a30", label: "Lapsed" },
  prospect: { bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.55)", label: "Prospect" },
};

export default function RetentionClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [winBack, setWinBack] = useState<{ customer: Customer; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [visitFor, setVisitFor] = useState<Customer | null>(null);
  const [visitProduct, setVisitProduct] = useState<string>("");
  const [recording, setRecording] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [rRes, pRes] = await Promise.all([fetch("/api/retention"), fetch("/api/products")]);
      const rData = await rRes.json();
      if (!rRes.ok) throw new Error(rData.error ?? "Could not load retention.");
      setCustomers(rData.customers);
      setSummary(rData.summary);
      setAvailable(rData.available);
      if (pRes.ok) {
        const pData = await pRes.json();
        setProducts((pData.products ?? []).filter((p: Product) => p.active));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load retention.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openWinBack(c: Customer) {
    setCopied(false);
    setWinBack({ customer: c, text: draftWinBack(c.name, c.days_since_last_visit) });
  }

  async function copyWinBack() {
    if (!winBack) return;
    try {
      await navigator.clipboard.writeText(winBack.text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function recordVisit() {
    if (!visitFor) return;
    setRecording(true);
    setError(null);
    try {
      const res = await fetch(`/api/signups/${visitFor.signup_id}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visitProduct ? { product_id: visitProduct } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not record the visit.");
      setVisitFor(null);
      setVisitProduct("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not record the visit.");
    } finally {
      setRecording(false);
    }
  }

  if (loading) return <p className="text-black/50 text-sm">Loading retention…</p>;

  const lapsed = customers.filter((c) => c.retention_status === "lapsed");
  const active = customers.filter((c) => c.visit_count > 0 && c.retention_status !== "lapsed");

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(201,124,93,0.12)", color: "#8a4a30" }}>
          {error}
        </div>
      )}
      {!available && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.6)" }}>
          Retention data isn&apos;t available yet — apply migration 0007 in Supabase to switch it on.
        </div>
      )}

      {/* Metric cards */}
      {summary && (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Metric label="Repeat rate" value={`${summary.repeatRate}%`} />
          <Metric label="Customers" value={String(summary.customers)} />
          <Metric label="Returning" value={String(summary.returning)} />
          <Metric label="Lapsed" value={String(summary.lapsed)} accent="#8a4a30" />
        </div>
      )}

      {/* Lapsed — win-back */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold" style={{ color: "var(--lagoon)" }}>
          Slipping away ({lapsed.length})
        </h2>
        <div className="rounded-2xl border border-black/5 bg-white/70 overflow-hidden">
          {lapsed.length === 0 ? (
            <p className="px-6 py-6 text-black/50 text-sm">No lapsed customers — nice.</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {lapsed.map((c) => (
                <li key={c.signup_id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                  <div className="flex-1 min-w-[160px]">
                    <p className="font-medium" style={{ color: "var(--ink)" }}>{c.name}</p>
                    <p className="text-sm text-black/50">
                      {c.visit_count} visit{c.visit_count === 1 ? "" : "s"} · last{" "}
                      {c.days_since_last_visit}d ago · {money(c.total_spend_myr)}
                    </p>
                  </div>
                  <button
                    onClick={() => openWinBack(c)}
                    className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "var(--clay)" }}
                  >
                    Draft win-back
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Active customers */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold" style={{ color: "var(--lagoon)" }}>
          Customers ({active.length})
        </h2>
        <div className="rounded-2xl border border-black/5 bg-white/70 overflow-hidden">
          {active.length === 0 ? (
            <p className="px-6 py-6 text-black/50 text-sm">No customers with visits yet.</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {active.map((c) => {
                const st = STATUS_STYLE[c.retention_status];
                return (
                  <li key={c.signup_id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                    <div className="flex-1 min-w-[160px]">
                      <p className="font-medium" style={{ color: "var(--ink)" }}>{c.name}</p>
                      <p className="text-sm text-black/50">
                        {c.visit_count} visit{c.visit_count === 1 ? "" : "s"} · {money(c.total_spend_myr)}
                        {c.days_since_last_visit != null && <> · last {c.days_since_last_visit}d ago</>}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                    <button
                      onClick={() => {
                        setVisitProduct("");
                        setVisitFor(c);
                      }}
                      className="text-sm font-medium px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5"
                    >
                      Record visit
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Win-back modal */}
      {winBack && (
        <Modal onClose={() => setWinBack(null)}>
          <h3 className="font-display text-lg font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            Win back {winBack.customer.name}
          </h3>
          <p className="text-xs text-black/50">Draft only — review and edit before sending.</p>
          <textarea
            value={winBack.text}
            onChange={(e) => setWinBack({ ...winBack, text: e.target.value })}
            rows={5}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyWinBack}
              className="text-sm font-medium px-4 py-2 rounded-lg border border-black/10 hover:bg-black/5"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            {winBack.customer.phone && (
              <a
                href={whatsAppLink(winBack.customer.phone, winBack.text)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
                style={{ background: "#25D366" }}
              >
                Open in WhatsApp
              </a>
            )}
            <button onClick={() => setWinBack(null)} className="text-sm px-4 py-2 rounded-lg text-black/50 ml-auto">
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Record-visit modal */}
      {visitFor && (
        <Modal onClose={() => setVisitFor(null)}>
          <h3 className="font-display text-lg font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            Record a visit for {visitFor.name}
          </h3>
          <label className="block text-sm font-medium">What did they have?</label>
          <select
            value={visitProduct}
            onChange={(e) => setVisitProduct(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm bg-white"
          >
            <option value="">Foot Hydrotherapy Soak — RM40.00 (default)</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {money(p.price_myr)}
              </option>
            ))}
          </select>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setVisitFor(null)} className="text-sm px-4 py-2 rounded-lg text-black/50">
              Cancel
            </button>
            <button
              onClick={recordVisit}
              disabled={recording}
              className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--lagoon)" }}
            >
              {recording ? "Recording…" : "Record visit"}
            </button>
          </div>
        </Modal>
      )}
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

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-3">{children}</div>
    </div>
  );
}
