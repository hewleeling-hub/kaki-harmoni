"use client";

import { useEffect, useMemo, useState } from "react";
import { whatsAppLink } from "@/lib/whatsapp";
import { customerRef } from "@/lib/customer";
import { draftEnquiryFollowup } from "@/lib/followup";
import {
  ENQUIRY_SOURCES,
  ENQUIRY_STATUS,
  ENQUIRY_FOLLOWED_UP,
  ENQUIRY_LOST,
  enquiryIsDue,
} from "@/lib/enquiry";

// The public address the customer's booking link points at.
const SITE = "https://kaki-harmoni.vercel.app";

interface Enquiry {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  referral_source: string | null;
  status: string;
  customer_no: number | null;
  last_followed_up_at: string | null;
}

type Voucher = { price: string; sellUntilLabel: string; redeemByLabel: string } | null;

function todayKL(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
}

function ago(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} days ago`;
}

export default function EnquiriesClient({ voucher }: { voucher: Voucher }) {
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null);
  const [stats, setStats] = useState({ total: 0, booked: 0 });
  const [error, setError] = useState<string | null>(null);

  // Quick-add form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<string>(ENQUIRY_SOURCES[0]);
  const [date, setDate] = useState(todayKL());
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Follow-up draft (staff review before anything opens)
  const [target, setTarget] = useState<Enquiry | null>(null);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showLost, setShowLost] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/enquiries");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEnquiries(data.enquiries);
      setStats(data.stats);
    } catch {
      setError("Could not load enquiries. Please refresh.");
      setEnquiries([]);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError("Please enter their name.");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, referral_source: source, enquired_on: date }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Could not save. Please try again.");
        return;
      }
      setName("");
      setPhone("");
      setDate(todayKL());
      await load();
    } catch {
      setFormError("Could not save. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  async function setStatus(id: string, status: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/signups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError("Could not update this enquiry. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  function openDraft(en: Enquiry) {
    // With an offer on sale the link goes straight to its checkout; otherwise to
    // slot-picking. Either way the customer is already known, so no form first.
    const link = voucher
      ? `${SITE}/purchase/${en.id}?option=eleven-eleven&later=1`
      : `${SITE}/purchase/${en.id}/book`;
    setTarget(en);
    setText(draftEnquiryFollowup({ name: en.name, bookingLink: link, voucher }));
    setCopied(false);
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  // Staff tap this after sending, so the lead leaves the "due" list.
  async function markSentAndClose() {
    if (target) await setStatus(target.id, ENQUIRY_FOLLOWED_UP);
    setTarget(null);
  }

  const { due, waiting, lost } = useMemo(() => {
    const list = enquiries ?? [];
    const lastTouch = (e: Enquiry) => e.last_followed_up_at ?? e.created_at;
    return {
      due: list.filter((e) => enquiryIsDue(e.status, lastTouch(e))),
      waiting: list.filter((e) => e.status !== ENQUIRY_LOST && !enquiryIsDue(e.status, lastTouch(e))),
      lost: list.filter((e) => e.status === ENQUIRY_LOST),
    };
  }, [enquiries]);

  const rate = stats.total > 0 ? Math.round((stats.booked / stats.total) * 100) : 0;

  function Row({ e }: { e: Enquiry }) {
    const busy = busyId === e.id;
    return (
      <li className="rounded-xl border border-black/10 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-semibold tracking-wide text-black/45">{customerRef(e.customer_no)}</p>
          <p className="font-medium">{e.name}</p>
          <p className="text-xs text-black/55">
            {e.referral_source ?? "—"} · {e.phone ?? "no number"} · asked {ago(e.created_at)}
            {e.status === ENQUIRY_FOLLOWED_UP && e.last_followed_up_at && (
              <> · followed up {ago(e.last_followed_up_at)}</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {e.status !== ENQUIRY_LOST && (
            <>
              <button
                onClick={() => openDraft(e)}
                disabled={busy}
                className="text-xs font-medium px-2.5 py-1.5 rounded text-white disabled:opacity-60"
                style={{ background: "#25D366" }}
              >
                Follow up
              </button>
              <button
                onClick={() => setStatus(e.id, "signed_up")}
                disabled={busy}
                title="They've booked — moves them to the main dashboard"
                className="text-xs font-medium px-2.5 py-1.5 rounded border border-green-200 text-green-700 disabled:opacity-60"
              >
                Booked
              </button>
              <button
                onClick={() => setStatus(e.id, ENQUIRY_LOST)}
                disabled={busy}
                className="text-xs font-medium px-2.5 py-1.5 rounded border border-black/10 text-black/60 disabled:opacity-60"
              >
                Not interested
              </button>
            </>
          )}
          {e.status === ENQUIRY_LOST && (
            <button
              onClick={() => setStatus(e.id, ENQUIRY_STATUS)}
              disabled={busy}
              className="text-xs font-medium px-2.5 py-1.5 rounded border border-black/10 disabled:opacity-60"
            >
              Reopen
            </button>
          )}
        </div>
      </li>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Enquiries logged" value={stats.total} />
        <Stat label="Went on to book" value={stats.booked} />
        <Stat label="Enquiry → booking" value={`${rate}%`} />
        <Stat label="Need a follow-up" value={due.length} accent />
      </div>

      <form onSubmit={add} className="bg-white/80 rounded-2xl border border-black/5 p-5 space-y-3">
        <h2 className="font-display text-lg font-semibold">Log an enquiry</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-sm">
            <span className="block text-black/55 mb-1">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2"
              placeholder="As shown in the chat"
            />
          </label>
          <label className="text-sm">
            <span className="block text-black/55 mb-1">Phone (if WhatsApp)</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              className="w-full rounded-lg border border-black/10 px-3 py-2"
              placeholder="012-345 6789"
            />
          </label>
          <label className="text-sm">
            <span className="block text-black/55 mb-1">Came from</span>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 bg-white"
            >
              {ENQUIRY_SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-black/55 mb-1">They messaged on</span>
            <input
              type="date"
              value={date}
              max={todayKL()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2"
            />
          </label>
        </div>
        {formError && <p className="text-sm text-red-700">{formError}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={adding}
            className="text-sm font-medium px-4 py-2 rounded-lg text-white disabled:opacity-60"
            style={{ background: "var(--lagoon)" }}
          >
            {adding ? "Saving…" : "Add enquiry"}
          </button>
          <p className="text-xs text-black/45">No number from Messenger? Leave it blank — you can copy the message instead.</p>
        </div>
      </form>

      {enquiries === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 bg-black/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold">
              Needs a follow-up <span className="text-black/40 font-normal">{due.length}</span>
            </h2>
            {due.length === 0 ? (
              <p className="text-sm text-black/50 rounded-xl border border-dashed border-black/10 p-5">
                {enquiries.length === 0
                  ? "No enquiries logged yet. Add the people who have messaged you above."
                  : "Nobody is waiting on a nudge right now."}
              </p>
            ) : (
              <ul className="space-y-2">{due.map((e) => <Row key={e.id} e={e} />)}</ul>
            )}
          </section>

          {waiting.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-semibold">
                Not due yet <span className="text-black/40 font-normal">{waiting.length}</span>
              </h2>
              <ul className="space-y-2">{waiting.map((e) => <Row key={e.id} e={e} />)}</ul>
            </section>
          )}

          {lost.length > 0 && (
            <section className="space-y-3">
              <button onClick={() => setShowLost((v) => !v)} className="text-sm text-black/55 underline">
                {showLost ? "Hide" : "Show"} not interested ({lost.length})
              </button>
              {showLost && <ul className="space-y-2">{lost.map((e) => <Row key={e.id} e={e} />)}</ul>}
            </section>
          )}
        </>
      )}

      {target && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Follow up · {target.name}</h2>
              <p className="text-sm text-black/55 mt-1">
                Review and edit. Nothing is sent until you send it yourself.
              </p>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
            {!target.phone && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2">
                No phone number — copy the message and paste it into the Messenger chat.
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <button onClick={() => setTarget(null)} className="text-sm px-3 py-1.5 rounded border border-black/10">
                Cancel
              </button>
              <button onClick={copyText} className="text-sm px-3 py-1.5 rounded border border-black/10 hover:bg-black/5">
                {copied ? "Copied!" : "Copy"}
              </button>
              {target.phone ? (
                <a
                  href={whatsAppLink(target.phone, text)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={markSentAndClose}
                  className="text-sm px-3 py-1.5 rounded text-white font-medium"
                  style={{ background: "#25D366" }}
                >
                  Open WhatsApp &amp; mark followed up
                </a>
              ) : (
                <button
                  onClick={markSentAndClose}
                  className="text-sm px-3 py-1.5 rounded text-white font-medium"
                  style={{ background: "var(--lagoon)" }}
                >
                  I&apos;ve sent it
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-white/80 rounded-2xl border border-black/5 p-5">
      <p className="text-xs uppercase tracking-wide text-black/40">{label}</p>
      <p
        className="font-display text-3xl font-semibold mt-1"
        style={{ color: accent ? "var(--clay)" : "var(--lagoon-dark)" }}
      >
        {value}
      </p>
    </div>
  );
}
