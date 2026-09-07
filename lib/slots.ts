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
 * How many machines are in use at the instant `atMinutes` — every slot that
 * started within one cycle of it still has its machine occupied.
 */
function concurrentAt(seatsByTime: Record<string, number>, atMinutes: number): number {
  let total = 0;
  for (let back = 0; back < MACHINE_CYCLE_MINUTES; back += SLOT_INTERVAL_MINUTES) {
    const started = atMinutes - back;
    if (started >= 0) total += seatsByTime[toTime(started)] ?? 0;
  }
  return total;
}

/**
 * The most machines that will be in use at any moment during a soak beginning
 * at `time` — so `MAX_CAPACITY_PER_SLOT` minus this is how many more people
 * can actually start then.
 *
 * The rule has to look BOTH WAYS, which two simpler versions get wrong:
 *
 *  - Counting only the bookings made AT a slot treats the machines as if they
 *    reset instantly. A full 10:30 left 11:00 looking wide open, when every
 *    machine is mid-cycle until 11:15.
 *
 *  - Looking only backwards is still wrong, and it is the subtler failure.
 *    Three booked at 10:00 and one at 10:30 commits all four machines across
 *    10:00–10:45: a fourth 10:00 booking would take the very machine the 10:30
 *    guest is waiting for. The later booking has to close the earlier slot.
 *
 *  - Simply adding the slot before and the slot after over-blocks instead. Two
 *    at 09:30 and two at 10:30 never overlap each other, so 10:00 still has a
 *    machine free even though those four sum to capacity.
 *
 * What is actually being asked is whether a machine is free for the whole of
 * the new guest's 45 minutes, so this takes the PEAK number in use across that
 * window rather than a sum. Machine assignment is an interval-graph colouring
 * with equal-length intervals, where a peak of N is exactly the condition for
 * N machines to suffice — so this is not a heuristic, and a brute-force check
 * over every reachable arrangement of five consecutive slots agrees with it in
 * every case.
 *
 * Everything derives from SESSION_MINUTES, MACHINE_REST_MINUTES and
 * SLOT_INTERVAL_MINUTES, so changing the rest period or moving to a 45-minute
 * grid can't leave a stale assumption behind.
 */
export function machinesBusyAt(seatsByTime: Record<string, number>, time: string): number {
  const start = toMinutes(time);
  let peak = 0;
  for (let ahead = 0; ahead < MACHINE_CYCLE_MINUTES; ahead += SLOT_INTERVAL_MINUTES) {
    peak = Math.max(peak, concurrentAt(seatsByTime, start + ahead));
  }
  return peak;
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
