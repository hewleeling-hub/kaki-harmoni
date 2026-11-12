import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

// POST /api/packages/[id] — use one visit from a package (staff only).
//
// Writes a RM0 attended visit pointing at the package, the way a redeemed
// voucher does: the money was counted when the package was sold, so spend is
// never counted twice, but the soak shows in the guest's history and retention.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Staff only." }, { status: 401 });

  let body: { visit_on?: string } = {};
  try {
    body = await request.json();
  } catch {
    /* no body: today */
  }

  const todayKL = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
  const on = body.visit_on?.trim() || todayKL;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(on) || Number.isNaN(Date.parse(`${on}T00:00:00Z`)) || on > todayKL) {
    return NextResponse.json({ error: "Choose a date that is not in the future." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: pkg } = await admin
    .from("purchases")
    .select("id, signup_id, product_name, package_visits, package_expires_on, created_at")
    .eq("id", id)
    .not("package_visits", "is", null)
    .maybeSingle();
  if (!pkg) return NextResponse.json({ error: "Package not found." }, { status: 404 });

  if (pkg.package_expires_on && on > pkg.package_expires_on) {
    return NextResponse.json({ error: `This package expired on ${pkg.package_expires_on}.` }, { status: 409 });
  }
  if (on < (pkg.created_at as string).slice(0, 10)) {
    return NextResponse.json({ error: "A visit can't be dated before the package was bought." }, { status: 400 });
  }

  const { count } = await admin.from("purchases").select("id", { count: "exact", head: true }).eq("package_id", id);
  if ((count ?? 0) >= (pkg.package_visits as number)) {
    return NextResponse.json({ error: "All the visits in this package have been used." }, { status: 409 });
  }

  const name = `${pkg.product_name} — visit ${(count ?? 0) + 1} of ${pkg.package_visits}`;
  const { data: visit, error } = await admin
    .from("purchases")
    .insert({
      signup_id: pkg.signup_id,
      product_name: name,
      amount_myr: 0,
      payment_method: "package",
      status: "confirmed",
      visit_status: "attended",
      booking_date: on,
      package_id: id,
    })
    .select("id")
    .single();
  if (error || !visit) return NextResponse.json({ error: "Could not record the visit." }, { status: 500 });

  await admin.from("order_items").insert({
    purchase_id: visit.id,
    product_name: name,
    quantity: 1,
    unit_price_myr: 0,
    line_total_myr: 0,
  });
  await admin.from("signups").update({ status: "converted" }).eq("id", pkg.signup_id).neq("status", "converted");

  // Re-count: two taps at once could both pass the check above. If we went over,
  // take our row back out rather than leave a sixth visit on a five-visit package.
  const { count: after } = await admin.from("purchases").select("id", { count: "exact", head: true }).eq("package_id", id);
  if ((after ?? 0) > (pkg.package_visits as number)) {
    await admin.from("order_items").delete().eq("purchase_id", visit.id);
    await admin.from("purchases").delete().eq("id", visit.id);
    return NextResponse.json({ error: "All the visits in this package have been used." }, { status: 409 });
  }

  const supabase = await createClient();
  await logActivity(supabase, {
    entity_type: "purchase",
    entity_id: id,
    action: "package_visit_used",
    actor: staff.email ?? "staff",
    metadata: { visit_purchase_id: visit.id, visit_on: on, visit_no: after },
  });

  return NextResponse.json({ ok: true, used: after, of: pkg.package_visits });
}
