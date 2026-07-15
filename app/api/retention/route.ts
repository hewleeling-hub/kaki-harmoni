import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireManager } from "@/lib/auth";

type Row = {
  signup_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  referral_source: string | null;
  lead_score: number | null;
  visit_count: number;
  total_spend_myr: number;
  first_purchase_at: string | null;
  last_purchase_at: string | null;
  days_since_last_visit: number | null;
  retention_status: "prospect" | "new" | "returning" | "lapsed";
};

// GET /api/retention — customer retention stats + a summary (owner/manager only).
export async function GET() {
  const manager = await requireManager();
  if (!manager) {
    return NextResponse.json({ error: "Managers only." }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_stats")
    .select("*")
    .order("last_purchase_at", { ascending: false, nullsFirst: false });

  if (error) {
    // View not created yet (migration 0007) — return an empty, non-breaking payload.
    return NextResponse.json({
      customers: [],
      summary: { customers: 0, returning: 0, newCustomers: 0, lapsed: 0, repeatRate: 0, totalSpend: 0 },
      available: false,
    });
  }

  const rows = (data ?? []) as Row[];
  const withVisits = rows.filter((r) => r.visit_count > 0);
  const returning = rows.filter((r) => r.retention_status === "returning").length;
  const newCustomers = rows.filter((r) => r.retention_status === "new").length;
  const lapsed = rows.filter((r) => r.retention_status === "lapsed").length;
  const totalSpend = rows.reduce((sum, r) => sum + Number(r.total_spend_myr), 0);
  const repeatRate =
    withVisits.length > 0 ? Math.round((returning / withVisits.length) * 100) : 0;

  return NextResponse.json({
    customers: rows,
    summary: {
      customers: withVisits.length,
      returning,
      newCustomers,
      lapsed,
      repeatRate,
      totalSpend: Math.round(totalSpend * 100) / 100,
    },
    available: true,
  });
}
