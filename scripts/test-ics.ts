import { buildCalendar, EVENT_MINUTES } from "@/lib/ics";

let fails = 0;
const ok = (label: string, cond: boolean, extra = "") => {
  if (!cond) fails++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? "  → " + extra : ""}`);
};

const now = new Date("2026-11-02T04:00:00Z");
const ics = buildCalendar(
  [
    { id: "a1", date: "2026-11-06", time: "10:30", name: "Ah Ling", product: "11.11 Foot Spa Voucher" },
    { id: "a2", date: "2026-11-06", time: "17:30", name: "Tan, Mei; Lee", product: "First Soak" },
    { id: "a3", date: "2026-11-07", time: "bad", name: "Bad Time", product: "x" },
    { id: "a4", date: "2026-11-07", time: "11:00", name: null, product: null },
    { id: "a5", date: "2026-11-08", time: "12:00", name: "陈美玲".repeat(12), product: "Foot Hydrotherapy Soak" },
  ],
  now,
);
const lines = ics.split("\r\n");

ok("wrapped as a calendar", lines[0] === "BEGIN:VCALENDAR" && lines.at(-2) === "END:VCALENDAR" && lines.at(-1) === "");
ok("lines end CRLF, none bare LF", !/[^\r]\n/.test(ics));
ok("event is 45 minutes", EVENT_MINUTES === 45);
ok("10:30 KL is 02:30 UTC", ics.includes("DTSTART:20261106T023000Z"));
ok("ends 45 minutes later (03:15 UTC)", ics.includes("DTEND:20261106T031500Z"));
ok("17:30 KL is 09:30 UTC", ics.includes("DTSTART:20261106T093000Z"));
ok("name and product only in the summary", ics.includes("SUMMARY:Ah Ling — 11.11 Foot Spa Voucher"));
ok("comma and semicolon escaped", ics.includes("SUMMARY:Tan\\, Mei\; Lee — First Soak"));
ok("a malformed time is skipped, the rest survive", !ics.includes("Bad Time") && ics.includes("booking-a4@") && ics.includes("booking-a5@"));
ok("no name falls back to Unnamed", ics.includes("SUMMARY:Unnamed"));
ok("UID is stable per booking", ics.includes("UID:booking-a1@kakiharmoni.com"));
ok("DTSTAMP is now in UTC (04:00Z)", ics.includes("DTSTAMP:20261102T040000Z"));
ok("every line is 75 bytes or fewer", lines.every((l) => Buffer.byteLength(l, "utf8") <= 75));
ok("long Chinese name is folded", lines.some((l) => l.startsWith(" ")));
// Unfolded, a long name must come back whole and not split mid-character.
const unfolded = ics.replace(/\r\n /g, "");
ok("folding loses nothing and splits no character", unfolded.includes(`SUMMARY:${"陈美玲".repeat(12)} — Foot Hydrotherapy Soak`));
ok("no phone or status fields exist in the feed", !/TEL|PHONE|DESCRIPTION|STATUS/i.test(ics));

console.log(fails === 0 ? "\nall passed" : `\n${fails} FAILED`);
process.exit(fails === 0 ? 0 : 1);
