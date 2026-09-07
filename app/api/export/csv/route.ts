import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth";

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const user = await requireStaff();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: signups, error } = await supabase
    .from("signups")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load data." }, { status: 500 });
  }

  const { data: purchases } = await supabase.from("purchases").select("*");

  const headers = [
    "Name",
    "Email",
    "Phone",
    "Referral source",
    "Signup status",
    "Signed up at",
    "Lead score",
    "Purchase amount (MYR)",
    "Payment method",
    "Payment status",
    "Visit status",
    "Booking date",
    "Booking time",
  ];

  // ONE ROW PER BOOKING. This used to be one row per signup with
  // purchases.find(), which takes only the FIRST booking a person made — so a
  // returning guest's second and later visits were silently missing from the
  // export, and any total taken from it would have been wrong. A signup with no
  // booking yet still gets a row, with the purchase columns left blank, so
  // nobody drops out of the file entirely.
  const rows = (signups ?? []).flatMap((s) => {
    const person = [s.name, s.email, s.phone, s.referral_source, s.status, s.created_at, s.lead_score];
    const theirs = (purchases ?? [])
      .filter((pu) => pu.signup_id === s.id)
      .sort((a, b) => String(a.booking_date ?? "").localeCompare(String(b.booking_date ?? "")));

    if (theirs.length === 0) return [[...person, "", "", "", "", "", ""]];

    return theirs.map((p) => [
      ...person,
      p.amount_myr ?? "",
      p.payment_method ?? "",
      p.status ?? "",
      p.visit_status ?? "",
      p.booking_date ?? "",
      p.booking_time ?? "",
    ]);
  });

  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  const filename = `kaki-harmoni-signups-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
