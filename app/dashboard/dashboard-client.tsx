"use client";

import { useEffect, useState } from "react";
import { whatsAppLink } from "@/lib/whatsapp";
import { formatSlotTime } from "@/lib/slots";

interface Signup {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  referral_source: string | null;
  status: string;
  lead_score: number | null;
  lead_score_review_status: string | null;
}

interface Purchase {
  id: string;
  signup_id: string;
  amount_myr: number;
  status: string;
  booking_date: string | null;
  booking_time: string | null;
}

export default function DashboardClient() {
  const [signups, setSignups] = useState<Signup[] | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ name: string; phone: string; status: string }>({
    name: "",
    phone: "",
    status: "signed_up",
  });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Signup | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/signups");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load signups.");
      setSignups(data.signups);
      setPurchases(data.purchases);
    } catch {
      setError("Could not load the dashboard. Please refresh.");
      setSignups([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(s: Signup) {
    setEditingId(s.id);
    setDraft({ name: s.name, phone: s.phone ?? "", status: s.status });
  }

  async function saveEdit(id: string) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/signups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSignups((prev) => prev!.map((s) => (s.id === id ? data.signup : s)));
      setEditingId(null);
    } catch {
      setError("Could not save changes. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/signups/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSignups((prev) => prev!.filter((s) => s.id !== deleteTarget.id));
      setPurchases((prev) => prev.filter((p) => p.signup_id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Could not delete this signup. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const totalSignups = signups?.length ?? 0;
  const totalPurchases = purchases.length;
  const conversionPct = totalSignups > 0 ? Math.round((totalPurchases / totalSignups) * 100) : 0;
  const awaitingFollowUp = signups?.filter((s) => s.status !== "converted").length ?? 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Counter label="Total signups" value={totalSignups} />
        <Counter label="Total purchases" value={totalPurchases} />
        <Counter label="Conversion" value={`${conversionPct}%`} />
        <Counter label="Awaiting follow-up" value={awaitingFollowUp} accent="clay" />
      </div>

      <div className="bg-white/80 rounded-2xl border border-black/5 overflow-hidden">
        {signups === null ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 bg-black/5 rounded animate-pulse" />
            ))}
          </div>
        ) : signups.length === 0 ? (
          <div className="p-10 text-center text-black/50">
            No signups yet. Once someone signs up on the landing page, they&apos;ll show up here.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-black/50 border-b border-black/5">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Visit</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Signed up</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((s) => {
                const isEditing = editingId === s.id;
                return (
                  <tr key={s.id} className="border-b border-black/5 last:border-0">
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          value={draft.name}
                          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                          className="rounded border border-black/10 px-2 py-1 w-full"
                        />
                      ) : (
                        s.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-black/70">{s.email}</td>
                    <td className="px-4 py-3 text-black/70">{s.referral_source ?? "—"}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={draft.status}
                          onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                          className="rounded border border-black/10 px-2 py-1"
                        >
                          <option value="signed_up">signed_up</option>
                          <option value="converted">converted</option>
                        </select>
                      ) : (
                        <StatusBadge status={s.status} />
                      )}
                      {isEditing && (
                        <input
                          value={draft.phone}
                          onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                          placeholder="Phone"
                          className="mt-1 rounded border border-black/10 px-2 py-1 w-full text-xs"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-black/70 text-xs">
                      {(() => {
                        const p = purchases.find((pu) => pu.signup_id === s.id);
                        if (!p?.booking_date || !p?.booking_time) return "—";
                        return (
                          <>
                            {new Date(p.booking_date + "T00:00:00").toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                            <div className="text-black/50">{formatSlotTime(p.booking_time)}</div>
                          </>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-black/70">{s.lead_score ?? "—"}</td>
                    <td className="px-4 py-3 text-black/50 text-xs">
                      {new Date(s.created_at).toLocaleDateString()}
                      <div className="text-black/35">{daysAgo(s.created_at)}</div>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(s.id)}
                            disabled={savingId === s.id}
                            className="text-xs font-medium px-2 py-1 rounded text-white"
                            style={{ background: "var(--lagoon)" }}
                          >
                            {savingId === s.id ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs font-medium px-2 py-1 rounded border border-black/10"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {s.status !== "converted" && s.phone && (
                            <a
                              href={whatsAppLink(
                                s.phone,
                                `Hi ${s.name.split(" ")[0]}! This is Kaki Harmoni — just checking in on your RM25 first-visit foot soak + coffee. Want us to save you a slot this week?`,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium px-2 py-1 rounded text-white"
                              style={{ background: "#25D366" }}
                            >
                              Follow up
                            </a>
                          )}
                          <button
                            onClick={() => startEdit(s)}
                            className="text-xs font-medium px-2 py-1 rounded border border-black/10"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="text-xs font-medium px-2 py-1 rounded border border-red-200 text-red-700"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h2 className="font-display text-lg font-semibold">Delete this signup?</h2>
            <p className="text-sm text-black/60">
              This permanently removes <strong>{deleteTarget.name}</strong> and any linked purchase. This
              can&apos;t be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-sm px-3 py-1.5 rounded border border-black/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="text-sm px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function daysAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function Counter({
  label,
  value,
  accent = "lagoon",
}: {
  label: string;
  value: string | number;
  accent?: "lagoon" | "clay";
}) {
  return (
    <div className="bg-white/80 rounded-2xl border border-black/5 p-5">
      <p className="text-xs uppercase tracking-wide text-black/40">{label}</p>
      <p
        className="font-display text-3xl font-semibold mt-1"
        style={{ color: accent === "clay" ? "var(--clay)" : "var(--lagoon-dark)" }}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const converted = status === "converted";
  return (
    <span
      className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
      style={
        converted
          ? { background: "rgba(46,125,123,0.12)", color: "var(--lagoon-dark)" }
          : { background: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.6)" }
      }
    >
      {converted ? "Converted" : "Signed up"}
    </span>
  );
}
