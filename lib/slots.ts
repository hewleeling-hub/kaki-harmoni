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

/**
 * Which machines one guest occupies, as [start, end) offsets in minutes from
 * the moment their booking begins.
 *
 * One soak is one machine for a full cycle. TWO soaks back to back cannot be
 * the same machine twice — it has to stand for 30 minutes in between — so a
 * Double Reset takes a second machine, starting as the first soak ends:
 *
 *   soaks = 1   [0, 45)
 *   soaks = 2   [0, 45)  and  [15, 60)
 *
 * That 15-minute stagger is why the booking grid alone can't express this, and
 * why occupancy is tracked on a 15-minute lattice below.
 */
export function footprintFor(soaks: number): Array<[number, number]> {
  const spans: Array<[number, number]> = [];
  for (let i = 0; i < Math.max(1, soaks); i++) {
    const from = i * SESSION_MINUTES;
    spans.push([from, from + MACHINE_CYCLE_MINUTES]);
  }
  return spans;
}

/**
 * Machines in use at each 15-minute tick of the day. Every interval edge is a
 * multiple of the soak length, so ticking at 15 loses nothing.
 */
export type Occupancy = Map<number, number>;

export function addToOccupancy(
  occupancy: Occupancy,
  startTime: string,
  soaks: number,
  quantity: number,
): void {
  const start = toMinutes(startTime);
  for (const [from, to] of footprintFor(soaks)) {
    for (let t = start + from; t < start + to; t += SESSION_MINUTES) {
      occupancy.set(t, (occupancy.get(t) ?? 0) + quantity);
    }
  }
}

/**
 * How many more bookings of this shape will fit at `time` — 0 means the slot
 * is full for it.
 *
 * A slot can have room for a single soak and no room for a Double Reset, since
 * the Double needs two machines and holds the second one a quarter of an hour
 * longer. So availability genuinely depends on WHAT is being booked, which is
 * why /api/slots takes the chosen option.
 *
 * Machine assignment is interval-graph colouring, and interval graphs are
 * perfect: N machines suffice exactly when no instant needs more than N. So
 * checking every tick the new booking would touch is the real answer, not an
 * approximation of it — confirmed against a brute-force allocator over every
 * reachable arrangement of singles and doubles across five slots.
 */
export function remainingFor(
  occupancy: Occupancy,
  time: string,
  soaks: number,
  capacity: number = MAX_CAPACITY_PER_SLOT,
): number {
  const start = toMinutes(time);

  // How many machines one booking of this shape needs at each tick it touches.
  const need = new Map<number, number>();
  for (const [from, to] of footprintFor(soaks)) {
    for (let t = start + from; t < start + to; t += SESSION_MINUTES) {
      need.set(t, (need.get(t) ?? 0) + 1);
    }
  }

  let room = Infinity;
  for (const [tick, machines] of need) {
    const free = capacity - (occupancy.get(tick) ?? 0);
    room = Math.min(room, Math.floor(free / machines));
  }
  return Math.max(0, room === Infinity ? capacity : room);
}

/*
 * `machinesBusyAt(seatsByTime, time)` used to live here — a peak-concurrency
 * count over 30-minute slots. It was right for singles and is superseded by
 * `remainingFor` above, which works on the 15-minute lattice and so can also
 * express a Double Reset's second, staggered machine. The reasoning it carried
 * is preserved in remainingFor's comment; the two failed alternatives it warned
 * about — counting only the slot itself, and summing neighbouring slots — are
 * still the mistakes to avoid.
 */

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
