"use client";

import { useEffect, useState } from "react";
import { customerRef } from "@/lib/customer";
import { formatSlotTime } from "@/lib/slots";

type Booking = {
  id: string;
  name: string | null;
  phone: string | null;
  customer_no: number | null;
  product_name: string | null;
  status: string | null;
  visit_status: string | null;
};

type Schedule = {
  date: string;
  closed: boolean;
  capacity: number;
  slots: { time: string; remaining: number; bookings: Booking[] }[];
  other: Booking[];
  undated: Booking[];
  week: { date: string; count: number; closed: boolean }[];
};

// Kuala Lumpur's today, not the viewer's or the server's: the shop's days are KL days.
const todayKL = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });

const shiftDay = (iso: string, days: number) =>
  new Date(new Date(`${iso}T00:00:00Z`).getTime() + days * 86_400_000).toISOString().slice(0, 10);

const weekday = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export default function CalendarClient() {
  // Set after mount: the server runs on UTC and the shop on +8, so rendering
  // "today" in both places would mismatch after 4pm.
  const [date, setDate] = useState("");
  const [data, setData] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDate(todayKL());
  }, []);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/schedule?date=${encodeURIComponent(date)}`)
      .then(async (res) => {
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.error ?? "Could not load the schedule.");
        if (!cancelled) setData(payload as Schedule);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load the schedule.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  if (!date) return <p className="text-sm text-black/50">Loading…</p>;

  const today = todayKL();
  const total = data
    ? data.slots.reduce((n, s) => n + s.bookings.length, 0) + data.other.length + data.undated.length
    : 0;

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(201,124,93,0.12)", color: "#8a4a30" }}>
          {error}
        </div>
      )}

      {/* Date controls, the same shape as the one customers pick from. */}
      <div className="flex flex-wrap items-end gap-3">
        <button
          onClick={() => setDate(shiftDay(date, -1))}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5"
          aria-label="Previous day"
        >
          ←
        </button>
        <label className="text-sm">
          <span className="mb-1 block text-black/60">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2"
          />
        </label>
        <button
          onClick={() => setDate(shiftDay(date, 1))}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black/5"
          aria-label="Next day"
        >
          →
        </button>
        {date !== today && (
          <button
            onClick={() => setDate(today)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium hover:bg-black/5"
          >
            Today
          </button>
        )}
      </div>

      {/* The week, so a busy or closed day shows before you open it. */}
      {data && (
        <div className="grid grid-cols-7 gap-1.5">
          {data.week.map((d) => {
            const selected = d.date === date;
            return (
              <button
                key={d.date}
                onClick={() => setDate(d.date)}
                className="rounded-lg border px-1 py-2 text-center text-xs"
                style={
                  selected
                    ? { background: "var(--lagoon)", borderColor: "var(--lagoon)", color: "white" }
                    : { background: "white", borderColor: "rgba(0,0,0,0.1)" }
                }
              >
                <span className="block opacity-70">{weekday(d.date)}</span>
                <span className="block text-sm font-semibold">{Number(d.date.slice(8))}</span>
                <span className="block opacity-80">
                  {d.closed ? "Closed" : d.count === 0 ? "—" : `${d.count} booked`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <h2 className="font-display text-xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
        {longDate(date)}
        {data && !data.closed && (
          <span className="ml-2 text-sm font-normal text-black/50">
            {total} booking{total === 1 ? "" : "s"}
          </span>
        )}
      </h2>

      {loading && !data && <p className="text-sm text-black/50">Loading…</p>}

      {data?.closed && (
        <p className="rounded-xl bg-black/5 px-4 py-4 text-sm text-black/70">We&apos;re closed on this day.</p>
      )}

      {data && !data.closed && (
        <div className={`overflow-hidden rounded-2xl border border-black/5 bg-white/70 ${loading ? "opacity-60" : ""}`}>
          <ul className="divide-y divide-black/5">
            {data.slots.map((s) => {
              const free = s.remaining;
              const full = free <= 0;
              return (
                <li key={s.time} className="flex gap-4 px-4 py-3">
                  <div className="w-20 shrink-0">
                    <p className="text-sm font-semibold">{formatSlotTime(s.time)}</p>
                    <p
                      className="mt-0.5 text-xs font-medium"
                      style={{ color: full ? "#8a4a30" : free <= 2 ? "#8a6a20" : "var(--lagoon-dark)" }}
                    >
                      {full ? "Full" : `${free} of ${data.capacity} free`}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {s.bookings.length === 0 ? (
                      <p className="text-sm text-black/35">No bookings</p>
                    ) : (
                      s.bookings.map((b) => <BookingLine key={b.id} b={b} />)
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {data && data.other.length > 0 && (
        <Extra title="Booked at a time that isn't on the grid" rows={data.other} />
      )}
      {data && data.undated.length > 0 && (
        <Extra title="On this date, no time chosen" rows={data.undated} />
      )}

      <p className="text-xs text-black/45">
        Free machines are counted the same way the customer calendar counts them, so a slot that shows
        full here is full to customers too. Unpaid bookings hold their place.
      </p>
    </div>
  );
}

function BookingLine({ b }: { b: Booking }) {
  const paid = b.status === "confirmed";
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
      <span className="font-medium" style={{ color: "var(--ink)" }}>
        {b.name ?? "Unnamed"}
      </span>
      {b.customer_no != null && <span className="text-xs text-black/40">{customerRef(b.customer_no)}</span>}
      {b.phone && <span className="text-xs text-black/50">{b.phone}</span>}
      {b.product_name && <span className="text-xs text-black/60">· {b.product_name}</span>}
      <span
        className="rounded-full px-2 py-0.5 text-xs font-medium"
        style={
          paid
            ? { background: "rgba(46,125,123,0.12)", color: "var(--lagoon-dark)" }
            : { background: "rgba(201,124,93,0.15)", color: "#8a4a30" }
        }
      >
        {paid ? "Paid" : "Unpaid"}
      </span>
      {b.visit_status === "attended" && (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Attended</span>
      )}
      {b.visit_status === "no_show" && (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">No-show</span>
      )}
    </div>
  );
}

function Extra({ title, rows }: { title: string; rows: Booking[] }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 p-4">
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <div className="space-y-1.5">
        {rows.map((b) => (
          <BookingLine key={b.id} b={b} />
        ))}
      </div>
    </div>
  );
}
