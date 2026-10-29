import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { logActivity, logAudit } from "@/lib/activity";

// PATCH /api/vouchers/[id] — mark a voucher paid, or undo that (staff only).
//
// Only reserved <-> paid. Cancelling is left out on purpose: a cancelled
// voucher stops counting against the two-per-person cap, so it changes how
// many a customer may buy and should not be a one-tap button. Redeemed rows
// are untouchable here — redemption is tracked at the counter in StoreHub.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await requireStaff();
  if (!staff) {
    return NextResponse.json({ error: "Staff only." }, { status: 401 });
  }

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.status !== "paid" && body.status !== "reserved") {
    return NextResponse.json({ error: "Status must be paid or reserved." }, { status: 400 });
  }

  const markingPaid = body.status === "paid";
  const from = markingPaid ? "reserved" : "paid";

  /* The `.eq("status", from)` makes this a compare-and-set: two staff tapping
     at once, or a stale page, cannot flip a row that has already moved on
     (including to redeemed). Zero rows back means it was not in the state the
     screen thought it was. */
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vouchers")
    .update({ status: body.status, paid_at: markingPaid ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("status", from)
    .select("id, status, paid_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not update the voucher." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { error: "This voucher has changed since the page loaded. Refresh and try again." },
      { status: 409 },
    );
  }

  const supabase = await createClient();
  const actor = staff.email ?? "staff";
  await logAudit(supabase, {
    table_name: "vouchers",
    row_id: id,
    operation: "UPDATE",
    old_data: { status: from },
    new_data: { status: body.status },
    actor,
  });
  await logActivity(supabase, {
    entity_type: "voucher",
    entity_id: id,
    action: markingPaid ? "voucher_marked_paid" : "voucher_payment_undone",
    actor,
  });

  return NextResponse.json({ voucher: data });
}
