import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { logActivity, logAudit } from "@/lib/activity";
import { findOrCreateCustomer, phoneKeyFor } from "@/lib/customer";
import { packageExpiry, packageSize } from "@/lib/packages";

const METHODS: Record<string, string> = { cash: "cash", duitnow: "ewallet", card: "card" };

// GET /api/packages — package sales with visits used (staff only).
export async function GET() {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Staff only." }, { status: 401 });

  const admin = createAdminClient();
  const { data: sales, error } = await admin
    .from("purchases")
    .select("id, created_at, product_name, amount_myr, payment_method, package_visits, package_expires_on, signups(name, phone, customer_no)")
    .not("package_visits", "is", null)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Could not load packages." }, { status: 500 });

  const ids = (sales ?? []).map((s) => s.id);
  const used = new Map<string, string[]>();
  if (ids.length) {
    const { data: visits } = await admin
      .from("purchases")
      .select("package_id, booking_date, created_at")
      .in("package_id", ids)
      .order("created_at", { ascending: true });
    for (const v of visits ?? []) {
      const list = used.get(v.package_id as string) ?? [];
      list.push((v.booking_date as string | null) ?? (v.created_at as string).slice(0, 10));
      used.set(v.package_id as string, list);
    }
  }

  return NextResponse.json({
    packages: (sales ?? []).map((s) => ({ ...s, visit_dates: used.get(s.id) ?? [] })),
  });
}

// POST /api/packages — sell a package over the counter (staff only).
// One purchase for the full (possibly discounted) price; the visits are drawn
// later, one at a time, from /api/packages/[id].
export async function POST(request: NextRequest) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Staff only." }, { status: 401 });

  let body: { name?: string; phone?: string; product_id?: string; discount_pct?: number; payment_method?: string; sold_on?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim().slice(0, 120);
  const phone = body.phone?.trim().slice(0, 40);
  const method = METHODS[body.payment_method ?? "cash"];
  const discount = Number(body.discount_pct ?? 0);

  if (!name) return NextResponse.json({ error: "Enter the customer's name." }, { status: 400 });
  if (!phone || !phoneKeyFor(phone)) return NextResponse.json({ error: "Enter a phone number." }, { status: 400 });
  if (!method) return NextResponse.json({ error: "Choose how they paid." }, { status: 400 });
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    return NextResponse.json({ error: "Discount must be between 0 and 100%." }, { status: 400 });
  }

  const todayKL = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
  const soldOn = body.sold_on?.trim() || todayKL;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(soldOn) || Number.isNaN(Date.parse(`${soldOn}T00:00:00Z`)) || soldOn > todayKL) {
    return NextResponse.json({ error: "Choose the date they paid — it can't be in the future." }, { status: 400 });
  }

  const admin = createAdminClient();
  // The price is the catalogue's, never the request's. A package is sellable at
  // the counter even when switched off for online sale.
  const { data: product } = await admin.from("products").select("id, name, price_myr").eq("id", body.product_id ?? "").maybeSingle();
  const visits = packageSize(product?.name);
  if (!product || !visits) return NextResponse.json({ error: "Choose a package." }, { status: 400 });

  const list = Number(product.price_myr);
  const total = Math.round(list * (1 - discount / 100) * 100) / 100;
  const label = discount > 0 ? `${product.name} (${discount}% off)` : product.name;

  const found = await findOrCreateCustomer(admin, { name, phone, source: "Walk-in" });
  if (!found) return NextResponse.json({ error: "Could not add that customer. Please try again." }, { status: 500 });

  const backdated = soldOn < todayKL;
  const paidAt = backdated ? new Date(`${soldOn}T12:00:00+08:00`).toISOString() : new Date().toISOString();

  const { data: purchase, error } = await admin
    .from("purchases")
    .insert({
      signup_id: found.customer.id,
      product_name: label,
      amount_myr: total,
      payment_method: method,
      status: "confirmed",
      package_visits: visits,
      package_expires_on: packageExpiry(soldOn),
      ...(backdated ? { created_at: paidAt } : {}),
    })
    .select("id")
    .single();
  if (error || !purchase) return NextResponse.json({ error: "Could not record the sale. Nothing was saved." }, { status: 500 });

  const { error: itemError } = await admin.from("order_items").insert({
    purchase_id: purchase.id,
    product_id: product.id,
    product_name: label,
    quantity: 1,
    unit_price_myr: total,
    line_total_myr: total,
  });
  if (itemError) console.error("package order_items insert failed:", itemError.message);

  const supabase = await createClient();
  const actor = staff.email ?? "staff";
  await logActivity(supabase, {
    entity_type: "purchase",
    entity_id: purchase.id,
    action: "package_sold",
    actor,
    metadata: { visits, discount_pct: discount, payment_method: method, ...(backdated ? { paid_on: soldOn } : {}) },
  });
  await logAudit(supabase, {
    table_name: "purchases",
    row_id: purchase.id,
    operation: "INSERT",
    new_data: { signup_id: found.customer.id, amount_myr: total, package_visits: visits },
    actor,
  });

  return NextResponse.json(
    { ok: true, purchase_id: purchase.id, total, visits, expires_on: packageExpiry(soldOn), customer: { name: found.customer.name, customer_no: found.customer.customer_no } },
    { status: 201 },
  );
}
