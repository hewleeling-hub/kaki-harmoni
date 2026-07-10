"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { bookableDateRange, formatSlotTime } from "@/lib/slots";

interface Slot {
  time: string;
  remaining: number;
}

export default function BookingForm({ purchaseId, signupId }: { purchaseId: string; signupId: string }) {
  const router = useRouter();
  const { min, max } = bookableDateRange();
  const [date, setDate] = useState(min);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadSlots() {
      setLoadingSlots(true);
      setSelectedTime(null);
      setError(null);
      try {
        const res = await fetch(`/api/slots?date=${date}`);
        const data = await res.json();
        if (!cancelled) {
          if (!res.ok) throw new Error(data.error);
          setSlots(data.slots);
        }
      } catch {
        if (!cancelled) setError("Could not load available times. Please try another date.");
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }
    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [date]);

  async function confirmBooking() {
    if (!selectedTime) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchase_id: purchaseId, slot_date: date, slot_time: selectedTime }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        // Refresh slots in case it just filled up
        const refreshed = await fetch(`/api/slots?date=${date}`);
        const refreshedData = await refreshed.json();
        if (refreshed.ok) setSlots(refreshedData.slots);
        setSelectedTime(null);
        return;
      }
      router.push(`/purchase/${signupId}/success`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="visit-date" className="block text-sm font-medium mb-1">
          Date
        </label>
        <input
          id="visit-date"
          type="date"
          min={min}
          max={max}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 focus:outline-none focus:ring-2"
          style={{ ["--tw-ring-color" as string]: "var(--lagoon)" }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Time</label>
        {loadingSlots ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 rounded-lg bg-black/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
            {slots?.map((s) => {
              const full = s.remaining <= 0;
              const selected = selectedTime === s.time;
              return (
                <button
                  key={s.time}
                  type="button"
                  disabled={full}
                  onClick={() => setSelectedTime(s.time)}
                  className="text-xs rounded-lg px-2 py-2 border font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={
                    selected
                      ? { background: "var(--lagoon)", borderColor: "var(--lagoon)", color: "white" }
                      : { borderColor: "rgba(0,0,0,0.1)", color: "rgba(0,0,0,0.75)" }
                  }
                >
                  {formatSlotTime(s.time)}
                  {!full && s.remaining <= 2 && (
                    <span className="block text-[10px] mt-0.5 opacity-70">{s.remaining} left</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={confirmBooking}
        disabled={!selectedTime || submitting}
        className="w-full rounded-lg px-4 py-2.5 font-medium text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: "var(--clay)" }}
      >
        {submitting && (
          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        )}
        {submitting ? "Booking…" : selectedTime ? `Confirm ${formatSlotTime(selectedTime)}` : "Pick a time"}
      </button>
    </div>
  );
}
