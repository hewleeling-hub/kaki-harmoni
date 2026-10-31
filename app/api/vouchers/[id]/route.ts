import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { logActivity, logAudit } from "@/lib/activity";
import { ELEVEN_ELEVEN } from "@/config/promotions";

// PATCH /api/vouchers/[id] — mark a voucher paid, undo that, or redeem it
// (staff only).
//
// reserved <-> paid, and paid -> redeemed. Cancelling is left out on purpose: a
// cancelled voucher stops counting against the two-per-person cap, so it
// changes how many a customer may buy and should not be a one-tap button.
// There is no un-redeem either: redemption writes a visit, and taking one back
// would need a record of which row it wrote — the page asks for confirmation
// instead, and a wrong tap is fixed in Supabase.
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

  if (body.status === "redeemed") return redeem(id, staff.email ?? "staff");

  if (body.status !== "paid" && body.status !== "reserved") {
    return NextResponse.json({ error: "Status must be paid, reserved or redeemed." }, { status: 400 });
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

/**
 * Redeem a paid voucher and record the visit it pays for.
 *
 * The visit is what puts the soak in the guest's history and the retention
 * numbers; without it a redeemed voucher would be invisible there. It is written
 * the way the online checkout writes a held voucher being booked — a RM0
 * "(already paid)" line — so spend is not counted twice: the RM11 was already
 * counted when the voucher was sold.
 *
 * Two shapes, depending on whether a slot was booked against the voucher:
 *  - purchase_id set: that booking IS the visit, so it is marked attended and
 *    nothing new is written.
 *  - purchase_id null (the walk-in and "pay now, pick later" vouchers): a new
 *    attended RM0 visit dated today.
 *
 * The voucher is claimed first with a compare-and-set, so two taps or two staff
 * cannot each write a visit. If the visit then fails to write, the claim is
 * handed back, so a voucher is never left redeemed with nothing to show for it.
 */
async function redeem(id: string, actor: string) {
  const admin = createAdminClient();

  const { data: v } = await admin
    .from("vouchers")
    .select("id, status, expires_on, signup_id, purchase_id, product_id")
    .eq("id", id)
    .maybeSingle();
  if (!v) return NextResponse.json({ error: "Voucher not found." }, { status: 404 });

  if (v.status === "redeemed") {
    return NextResponse.json({ error: "This voucher has already been redeemed." }, { status: 409 });
  }
  if (v.status !== "paid") {
    return NextResponse.json({ error: "Only a paid voucher can be redeemed — mark it paid first." }, { status: 409 });
  }

  // Kuala Lumpur's today, not the server's: the redeem-by date is a KL date.
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
  if (v.expires_on < today) {
    return NextResponse.json({ error: `This voucher expired on ${v.expires_on} and can no longer be redeemed.` }, { status: 409 });
  }

  const { data: claimed } = await admin
    .from("vouchers")
    .update({ status: "redeemed", redeemed_at: new Date().toISOString(), redeemed_by: actor })
    .eq("id", id)
    .eq("status", "paid")
    .select("id")
    .maybeSingle();
  if (!claimed) {
    return NextResponse.json(
      { error: "This voucher has changed since the page loaded. Refresh and try again." },
      { status: 409 },
    );
  }

  const handBack = async () => {
    await admin
      .from("vouchers")
      .update({ status: "paid", redeemed_at: null, redeemed_by: null })
      .eq("id", id)
      .eq("status", "redeemed");
  };

  let visit: { purchase_id: string; created: boolean } | null = null;

  if (v.purchase_id) {
    const { error } = await admin
      .from("purchases")
      .update({ visit_status: "attended" })
      .eq("id", v.purchase_id);
    if (error) {
      await handBack();
      return NextResponse.json({ error: "Could not record the visit. Nothing was changed." }, { status: 500 });
    }
    visit = { purchase_id: v.purchase_id as string, created: false };
  } else if (v.signup_id) {
    const { data: product } = v.product_id
      ? await admin.from("products").select("name").eq("id", v.product_id).maybeSingle()
      : { data: null };
    const name = `${product?.name ?? ELEVEN_ELEVEN.title} (already paid)`;

    const { data: purchase, error } = await admin
      .from("purchases")
      .insert({
        signup_id: v.signup_id,
        product_name: name,
        amount_myr: 0,
        payment_method: "voucher",
        status: "confirmed",
        visit_status: "attended",
        booking_date: today,
      })
      .select("id")
      .single();
    if (error || !purchase) {
      await handBack();
      return NextResponse.json({ error: "Could not record the visit. Nothing was changed." }, { status: 500 });
    }

    const { error: itemError } = await admin.from("order_items").insert({
      purchase_id: purchase.id,
      product_id: v.product_id,
      product_name: name,
      quantity: 1,
      unit_price_myr: 0,
      line_total_myr: 0,
    });
    if (itemError) console.error("redemption order_items insert failed:", itemError.message);

    // A returning visit makes them a converted customer, as Record visit does.
    await admin.from("signups").update({ status: "converted" }).eq("id", v.signup_id).neq("status", "converted");

    visit = { purchase_id: purchase.id as string, created: true };
  }
  // No signup (it was deleted) and no booking: nothing to hang a visit on. The
  // voucher is still redeemed; the response says no visit was written.

  const supabase = await createClient();
  await logActivity(supabase, {
    entity_type: "voucher",
    entity_id: id,
    action: "voucher_redeemed",
    actor,
    metadata: { visit_purchase_id: visit?.purchase_id ?? null, visit_created: visit?.created ?? false },
  });
  await logAudit(supabase, {
    table_name: "vouchers",
    row_id: id,
    operation: "UPDATE",
    old_data: { status: "paid" },
    new_data: { status: "redeemed" },
    actor,
  });

  return NextResponse.json({ voucher: { id, status: "redeemed" }, visit });
}
