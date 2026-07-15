import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { logActivity, logAudit } from "@/lib/activity";

const DEFAULT_NAME = "Foot Hydrotherapy Soak";
const DEFAULT_PRICE_MYR = 40.0;

// POST /api/signups/[id]/visit — log a repeat visit for an existing customer
// (staff only). Creates a confirmed, attended order dated today so retention
// stats reflect the returning visit.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaff();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  let body: { product_id?: string; payment_method?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const supabase = createAdminClient();

  const { data: signup } = await supabase.from("signups").select("*").eq("id", id).maybeSingle();
  if (!signup) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  // Price the visit from the catalogue when a product is chosen; else the default soak.
  let productId: string | null = null;
  let productName = DEFAULT_NAME;
  let price = DEFAULT_PRICE_MYR;
  if (body.product_id) {
    const { data: product } = await supabase
      .from("products")
      .select("id, name, price_myr")
      .eq("id", body.product_id)
      .maybeSingle();
    if (product) {
      productId = product.id;
      productName = product.name;
      price = Number(product.price_myr);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      signup_id: id,
      product_name: productName,
      amount_myr: price,
      payment_method: body.payment_method?.trim() || "cash",
      status: "confirmed",
      visit_status: "attended",
      booking_date: today,
    })
    .select()
    .single();

  if (purchaseError || !purchase) {
    return NextResponse.json({ error: "Could not record the visit." }, { status: 500 });
  }

  await supabase.from("order_items").insert({
    purchase_id: purchase.id,
    product_id: productId,
    product_name: productName,
    quantity: 1,
    unit_price_myr: price,
    line_total_myr: price,
  });

  // A repeat visit means they're a converted customer.
  if (signup.status !== "converted") {
    await supabase.from("signups").update({ status: "converted" }).eq("id", id);
  }

  await logActivity(supabase, {
    entity_type: "purchase",
    entity_id: purchase.id,
    action: "repeat_visit_recorded",
    actor: user.email ?? "sales_dashboard",
    metadata: { amount_myr: price, product_name: productName },
  });
  await logAudit(supabase, {
    table_name: "purchases",
    row_id: purchase.id,
    operation: "INSERT",
    new_data: purchase,
    actor: user.email ?? "sales_dashboard",
  });

  return NextResponse.json({ purchase }, { status: 201 });
}
