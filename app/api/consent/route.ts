import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { logActivity, logAudit } from "@/lib/activity";

// Recording who has agreed to receive offers, and who has asked to stop (staff only).
//
// Consent belongs to the PERSON, and one person can own several sign-up rows, so
// both directions act on every row sharing a customer number.

const MAX_BATCH = 300;

const validNumbers = (v: unknown): number[] | null =>
  Array.isArray(v) && v.length > 0 && v.length <= MAX_BATCH && v.every((n) => Number.isInteger(n) && n > 0)
    ? (Array.from(new Set(v)) as number[])
    : null;

// POST { customer_nos: number[] } — they said yes on the paper list.
export async function POST(request: NextRequest) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Staff only." }, { status: 401 });

  let body: { customer_nos?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const nos = validNumbers(body.customer_nos);
  if (!nos) return NextResponse.json({ error: `Choose between 1 and ${MAX_BATCH} customers.` }, { status: 400 });

  const admin = createAdminClient();
  const actor = staff.email ?? "staff";

  // Only rows not already agreed: the date and source of the FIRST yes are the
  // record, and tapping a name twice must not overwrite them.
  const { data, error } = await admin
    .from("signups")
    .update({
      marketing_consent: true,
      marketing_consent_at: new Date().toISOString(),
      marketing_consent_source: "paper_form",
    })
    .in("customer_no", nos)
    .eq("marketing_consent", false)
    .select("id, customer_no");

  if (error) {
    console.error("record consent failed (is migration 0025 applied?):", error.message);
    return NextResponse.json({ error: "Could not save that. Nothing was changed." }, { status: 500 });
  }

  const supabase = await createClient();
  for (const row of data ?? []) {
    await logActivity(supabase, {
      entity_type: "signup",
      entity_id: row.id as string,
      action: "marketing_consent_recorded",
      actor,
      metadata: { source: "paper_form" },
    });
    await logAudit(supabase, {
      table_name: "signups",
      row_id: row.id as string,
      operation: "UPDATE",
      old_data: { marketing_consent: false },
      new_data: { marketing_consent: true },
      actor,
    });
  }

  const people = new Set((data ?? []).map((r) => r.customer_no as number)).size;
  return NextResponse.json({ ok: true, people });
}

// PATCH { customer_no } — they have asked us to stop.
//
// Switches consent off and deliberately LEAVES the date and source: they are the
// record of what was once agreed, and when it was withdrawn is in the audit log.
export async function PATCH(request: NextRequest) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Staff only." }, { status: 401 });

  let body: { customer_no?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const nos = validNumbers([body.customer_no]);
  if (!nos) return NextResponse.json({ error: "Choose a customer." }, { status: 400 });

  const admin = createAdminClient();
  const actor = staff.email ?? "staff";

  const { data, error } = await admin
    .from("signups")
    .update({ marketing_consent: false })
    .in("customer_no", nos)
    .eq("marketing_consent", true)
    .select("id");

  if (error) {
    console.error("withdraw consent failed:", error.message);
    return NextResponse.json({ error: "Could not save that. Nothing was changed." }, { status: 500 });
  }

  const supabase = await createClient();
  for (const row of data ?? []) {
    await logActivity(supabase, {
      entity_type: "signup",
      entity_id: row.id as string,
      action: "marketing_consent_withdrawn",
      actor,
    });
    await logAudit(supabase, {
      table_name: "signups",
      row_id: row.id as string,
      operation: "UPDATE",
      old_data: { marketing_consent: true },
      new_data: { marketing_consent: false },
      actor,
    });
  }

  return NextResponse.json({ ok: true });
}
