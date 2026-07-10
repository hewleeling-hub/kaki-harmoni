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

// Earliest bookable date is today; latest is 14 days out.
export function bookableDateRange(): { min: string; max: string } {
  const today = new Date();
  const max = new Date();
  max.setDate(max.getDate() + 14);
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  return { min: toISODate(today), max: toISODate(max) };
}
