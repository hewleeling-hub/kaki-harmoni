/**
 * The bookings as an iCalendar (.ics) feed, for subscribing from a phone.
 *
 * Deliberately thin: a name and a product per event, nothing else. The feed is
 * reachable by anyone holding its address (calendar apps cannot log in), so it
 * carries the least that is still useful — no phone number, no payment state.
 *
 * Pure and dependency-free so it can be tested without a database.
 */

export type IcsBooking = {
  id: string;
  /** ISO date, Kuala Lumpur. */
  date: string;
  /** "HH:MM", Kuala Lumpur. */
  time: string;
  name: string | null;
  product: string | null;
};

/** How long an event runs: a soak holds its machine for 15 minutes in the water and 30 to stand. */
export const EVENT_MINUTES = 45;

/** Malaysia is UTC+8 all year — no daylight saving to account for. */
const KL_OFFSET_MINUTES = 8 * 60;

const pad = (n: number) => String(n).padStart(2, "0");

/** A Kuala Lumpur wall-clock moment as an iCalendar UTC stamp, or null if it isn't one. */
function utcStamp(date: string, time: string, plusMinutes = 0): string | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})/.exec(time);
  if (!d || !t) return null;
  const ms = Date.UTC(+d[1], +d[2] - 1, +d[3], +t[1], +t[2]) + (plusMinutes - KL_OFFSET_MINUTES) * 60_000;
  const u = new Date(ms);
  if (Number.isNaN(u.getTime())) return null;
  return (
    `${u.getUTCFullYear()}${pad(u.getUTCMonth() + 1)}${pad(u.getUTCDate())}` +
    `T${pad(u.getUTCHours())}${pad(u.getUTCMinutes())}${pad(u.getUTCSeconds())}Z`
  );
}

/** RFC 5545 text escaping: backslash, semicolon, comma and newlines. */
const escapeText = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/**
 * Lines may not exceed 75 octets; longer ones continue on the next line after a
 * single space. Counted in bytes, not characters, and never split inside a
 * character — a Chinese name is three bytes a character.
 */
function fold(line: string): string {
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = Buffer.byteLength(ch, "utf8");
    const limit = out.length === 0 ? 75 : 74; // the leading space of a continuation counts
    if (bytes + size > limit) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  out.push(current);
  return out.map((l, i) => (i === 0 ? l : " " + l)).join("\r\n");
}

export function buildCalendar(bookings: IcsBooking[], now: Date = new Date()): string {
  const stamp = utcStamp(
    `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`,
    "00:00",
    KL_OFFSET_MINUTES + now.getUTCHours() * 60 + now.getUTCMinutes(),
  );

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kaki Harmoni//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Kaki Harmoni bookings",
    "X-WR-TIMEZONE:Asia/Kuala_Lumpur",
    // Hints only — each calendar app refreshes on its own schedule.
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];

  for (const b of bookings) {
    const start = utcStamp(b.date, b.time);
    const end = utcStamp(b.date, b.time, EVENT_MINUTES);
    if (!start || !end) continue; // a malformed row is skipped, never allowed to break the feed

    const summary = [b.name?.trim() || "Unnamed", b.product?.trim()].filter(Boolean).join(" — ");
    lines.push(
      "BEGIN:VEVENT",
      `UID:booking-${b.id}@kakiharmoni.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeText(summary)}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
