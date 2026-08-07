import { BOOKING_START_DATE, BOOKING_WINDOW_DAYS } from "@/lib/config";

// TODO: adjust to Kaki Harmoni's real operating hours if different.
export const BUSINESS_HOURS = { openHour: 10, closeHour: 20 }; // 10:00 – 20:00

export const SLOT_INTERVAL_MINUTES = 30;

// Matches the 4 foot hydrotherapy machines — max 4 concurrent bookings per slot.
export const MAX_CAPACITY_PER_SLOT = 4;

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
