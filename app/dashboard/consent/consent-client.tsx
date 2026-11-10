"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { customerRef } from "@/lib/customer";
import type { ConsentPerson } from "@/lib/consent-people";

const SOURCE_LABEL: Record<string, string> = {
  web_form: "website",
  walk_in_sale: "walk-in sale",
  paper_form: "paper form",
  whatsapp: "WhatsApp",
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kuala_Lumpur" }) : "";

export default function ConsentClient({ people }: { people: ConsentPerson[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyNo, setBusyNo] = useState<number | null>(null);

  // Add a contact: somebody who is not a customer yet but agreed on WhatsApp.
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cConfirmed, setCConfirmed] = useState(false);
  const [cSaving, setCSaving] = useState(false);

  const toAsk = useMemo(() => people.filter((p) => !p.agreed), [people]);
  const agreed = useMemo(() => people.filter((p) => p.agreed), [people]);

  const q = query.trim().toLowerCase();
  const shown = toAsk.filter(
    (p) => !q || [p.name ?? "", p.phone ?? "", customerRef(p.customer_no)].join(" ").toLowerCase().includes(q),
  );

  const toggle = (no: number) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(no)) next.delete(no);
      else next.add(no);
      return next;
    });

  async function save() {
    setSaving(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_nos: [...picked] }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error ?? "Could not save that.");
      setNote(`Recorded ${payload.people} customer${payload.people === 1 ? "" : "s"} as agreed.`);
      setPicked(new Set());
      setConfirmed(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save that.");
    } finally {
      setSaving(false);
    }
  }

  async function addContact(e: React.FormEvent) {
    e.preventDefault();
    setCSaving(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/consent/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cName, phone: cPhone, confirmed: cConfirmed }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error ?? "Could not add that contact.");
      const who = `${payload.customer.name ?? "Contact"} (${customerRef(payload.customer.customer_no)})`;
      setNote(
        payload.already_agreed
          ? `${who} was already on the offers list — nothing changed.`
          : payload.created
            ? `Added ${who} and recorded them as agreed.`
            : `That number was already on file as ${who} — recorded as agreed.`,
      );
      setCName("");
      setCPhone("");
      setCConfirmed(false);
      router.refresh();
    } catch (err) {
      // Kept as typed so a mistake in the number can be fixed without retyping.
      setError(err instanceof Error ? err.message : "Could not add that contact.");
    } finally {
      setCSaving(false);
    }
  }

  async function withdraw(p: ConsentPerson) {
    // A decision with consequences: they will drop off every offers list.
    if (!window.confirm(`Record that ${p.name ?? "this customer"} has asked us to stop? They will no longer be on the offers list.`)) return;
    setBusyNo(p.customer_no);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/consent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_no: p.customer_no }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error ?? "Could not save that.");
      setNote(`${p.name ?? "Customer"} removed from the offers list.`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save that.");
    } finally {
      setBusyNo(null);
    }
  }

  return (
    <div className="space-y-8">
      {note && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{note}</p>}
      {error && (
        <p className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(201,124,93,0.12)", color: "#8a4a30" }}>
          {error}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold" style={{ color: "var(--lagoon)" }}>
          Add a contact
        </h2>
        <p className="text-sm text-black/60">
          For someone who isn&apos;t a customer yet but has told us on WhatsApp that they&apos;d like to hear about our specials.
        </p>
        <form onSubmit={addContact} className="space-y-3 rounded-2xl border border-black/10 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-black/55">Name</span>
              <input
                required
                value={cName}
                onChange={(e) => setCName(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-black/55">WhatsApp number</span>
              <input
                required
                inputMode="tel"
                value={cPhone}
                onChange={(e) => setCPhone(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={cConfirmed} onChange={(e) => setCConfirmed(e.target.checked)} />
            <span>They agreed in a WhatsApp message, and I have that message.</span>
          </label>
          <button
            type="submit"
            disabled={!cConfirmed || cSaving}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--lagoon-dark)" }}
          >
            {cSaving ? "Adding…" : "Add contact"}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-xl font-semibold" style={{ color: "var(--lagoon)" }}>
            Still to ask ({toAsk.length})
          </h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a customer"
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          />
        </div>
        <p className="text-sm text-black/60">
          Tick the people who said yes on the paper list. Tick only what is on the paper — nobody is on the offers list unless they
          actually agreed.
        </p>

        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white/70">
          {shown.length === 0 ? (
            <p className="px-6 py-6 text-sm text-black/50">
              {toAsk.length === 0 ? "Everyone on file has agreed." : "No one matches that search."}
            </p>
          ) : (
            <ul className="divide-y divide-black/5">
              {shown.map((p) => (
                <li key={p.customer_no}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-black/[0.02]">
                    <input
                      type="checkbox"
                      checked={picked.has(p.customer_no)}
                      onChange={() => toggle(p.customer_no)}
                      disabled={saving}
                    />
                    <span className="w-14 shrink-0 text-xs text-black/40">{customerRef(p.customer_no)}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{p.name ?? "—"}</span>
                    <span className="text-sm text-black/50">{p.phone}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {picked.size > 0 && (
          <div className="sticky bottom-3 space-y-2 rounded-xl border border-black/10 bg-white p-4 shadow-sm">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
              <span>These customers ticked yes on the signed paper list.</span>
            </label>
            <button
              onClick={save}
              disabled={!confirmed || saving}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--lagoon-dark)" }}
            >
              {saving ? "Saving…" : `Record ${picked.size} as agreed`}
            </button>
            <button onClick={() => setPicked(new Set())} disabled={saving} className="ml-3 text-sm text-black/50 underline">
              Clear
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold" style={{ color: "var(--lagoon)" }}>
          Agreed ({agreed.length})
        </h2>
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white/70">
          {agreed.length === 0 ? (
            <p className="px-6 py-6 text-sm text-black/50">No one has agreed yet.</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {agreed.map((p) => (
                <li key={p.customer_no} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                  <span className="w-14 shrink-0 text-xs text-black/40">{customerRef(p.customer_no)}</span>
                  <span className="min-w-0 flex-1 font-medium">
                    {p.name ?? "—"}
                    <span className="ml-2 text-xs font-normal text-black/45">
                      {fmt(p.agreed_at)}
                      {p.source ? ` · ${SOURCE_LABEL[p.source] ?? p.source}` : ""}
                    </span>
                  </span>
                  <span className="text-sm text-black/50">{p.phone}</span>
                  <button
                    onClick={() => withdraw(p)}
                    disabled={busyNo === p.customer_no}
                    className="rounded-lg border border-black/10 px-3 py-1 text-xs font-medium hover:bg-black/5 disabled:opacity-50"
                  >
                    {busyNo === p.customer_no ? "Saving…" : "They asked to stop"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
