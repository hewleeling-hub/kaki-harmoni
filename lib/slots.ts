import { BOOKING_START_DATE, BOOKING_WINDOW_DAYS } from "@/lib/config";

// TODO: adjust to Kaki Harmoni's real operating hours if different.
export const BUSINESS_HOURS = { openHour: 10, closeHour: 20 }; // 10:00 – 20:00

export const SLOT_INTERVAL_MINUTES = 30;

// Matches the 4 foot hydrotherapy machines — max 4 concurrent bookings per slot.
export const MAX_CAPACITY_PER_SLOT = 4;

/** A soak is 15 minutes in the water. */
export const SESSION_MINUTES = 15;

/** The machine then has to stand for 30 minutes before it can run again. */
export const MACHINE_REST_MINUTES = 30;

/**
 * So one guest ties up one machine for 45 minutes from the moment they start,
 * not 15. A machine that starts at 10:30 finishes at 10:45 and is not ready
 * again until 11:15 — which is why an 11:00 booking cannot use it.
 */
export const MACHINE_CYCLE_MINUTES = SESSION_MINUTES + MACHINE_REST_MINUTES;

const toMinutes = (time: string): number => {
  const [h, m] = time.split(":");
  return parseInt(h, 10) * 60 + parseInt(m, 10);
};

const toTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/**
 * Slot start times whose bookings still have a machine tied up at `time` —
 * `time` itself, plus every earlier slot that began less than one machine
 * cycle ago.
 *
 * On the current numbers (45-minute cycle, 30-minute slots) that is two: the
 * slot itself and the one before it. Derived rather than hardcoded so that
 * changing the rest period, the soak length or the slot interval doesn't
 * quietly leave a wrong constant behind.
 */
export function blockingSlotsFor(time: string): string[] {
  const start = toMinutes(time);
  const slots: string[] = [];
  for (let back = 0; back < MACHINE_CYCLE_MINUTES; back += SLOT_INTERVAL_MINUTES) {
    const earlier = start - back;
    if (earlier >= 0) slots.push(toTime(earlier));
  }
  return slots;
}

/**
 * How many of the machines are unavailable at `time`, given how many people
 * are booked into each slot.
 *
 * Counting only the bookings made AT a slot was wrong: it treated each slot as
 * if the machines reset instantly, so a full 10:30 still left 11:00 looking
 * wide open. Five people booked at 10:30 means every machine is mid-cycle at
 * 11:00 and the earliest anyone can actually start is 11:15.
 */
export function machinesBusyAt(seatsByTime: Record<string, number>, time: string): number {
  return blockingSlotsFor(time).reduce((total, t) => total + (seatsByTime[t] ?? 0), 0);
}

export function generateSlotsForDay(): string[] {
  const slots: string[] = [];
  for (let h = BUSINESS_HOURS.openHour; h < BUSINESS_HOURS.closeHour; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL_MINUTES) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

export function formatSlotTime(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${mStr} ${period}`;
}

// Earliest bookable date is the later of today or BOOKING_START_DATE; the
// calendar then runs BOOKING_WINDOW_DAYS ahead of that.
export function bookableDateRange(): { min: string; max: string } {
  // Local (not UTC) formatting so a fixed start date doesn't shift a day.
  const toISODate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;

  const today = new Date();
  const start = new Date(`${BOOKING_START_DATE}T00:00:00`);
  const min = start > today ? start : today;
  const max = new Date(min);
  max.setDate(max.getDate() + BOOKING_WINDOW_DAYS);
  return { min: toISODate(min), max: toISODate(max) };
}
