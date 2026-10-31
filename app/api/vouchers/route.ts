import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { logActivity, logAudit } from "@/lib/activity";
import { findOrCreateCustomer, phoneKeyFor } from "@/lib/customer";
import { voucherAllowance, refuseVoucherClaim } from "@/lib/vouchers";
import { activeVoucherOffer, ELEVEN_ELEVEN } from "@/config/promotions";

// GET /api/vouchers — every voucher with its owner and booked slot (staff only).
//
// Service-role client because `vouchers` has RLS on and no policies: the
// browser can never read it, so the staff check below is the only gate.
export async function GET() {
  const staff = await requireStaff();
  if (!staff) {
    return NextResponse.json({ error: "Staff only." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vouchers")
    .select(
      "id, created_at, phone_normalised, price_myr, status, expires_on, paid_at, redeemed_at, voucher_no, notes, purchase_id, signups(name, phone), purchases(booking_date, booking_time)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load vouchers." }, { status: 500 });
  }

  return NextResponse.json({ vouchers: data ?? [] });
}

// How the guest paid at the counter. DuitNow is stored as 'ewallet', the same
// word the online checkout writes, so one payment method means one thing in the
// dashboard whichever way the sale arrived.
const METHODS: Record<string, string> = { cash: "cash", duitnow: "ewallet", card: "card" };

// POST /api/vouchers — record a voucher sold over the counter (staff only).
//
// A walk-in buys and pays on the spot, so this writes everything the online
// route would have written once the money arrived: the customer, a confirmed
// purchase, its line item, and one voucher row per voucher — already paid, with
// no slot, which is exactly what makes it redeemable later. Written the same way
// so the per-person cap, the redeem-by date and the staff list all treat it like
// an online sale. It goes through the SAME cap and sale-window rules; a counter
// sale is not a way round the two-per-person limit printed on the poster.
export async function POST(request: NextRequest) {
  const staff = await requireStaff();
  if (!staff) {
    return NextResponse.json({ error: "Staff only." }, { status: 401 });
  }

  let body: { name?: string; phone?: string; quantity?: number; payment_method?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim().slice(0, 120);
  const phone = body.phone?.trim().slice(0, 40);
  const quantity = Number(body.quantity ?? 1);
  const method = METHODS[body.payment_method ?? "cash"];

  if (!name) return NextResponse.json({ error: "Enter the customer's name." }, { status: 400 });
  if (!phone || !phoneKeyFor(phone)) {
    return NextResponse.json({ error: "Enter a phone number — it is how the two-per-person limit is counted." }, { status: 400 });
  }
  if (!method) return NextResponse.json({ error: "Choose how they paid." }, { status: 400 });

  const liveOffer = activeVoucherOffer();
  const offer = liveOffer ?? ELEVEN_ELEVEN;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > offer.maxPerPerson) {
    return NextResponse.json({ error: `Choose 1 to ${offer.maxPerPerson} vouchers.` }, { status: 400 });
  }

  const admin = createAdminClient();

  // The cap and the sale window, before anything is written — a refused sale
  // must not leave a customer row behind.
  const refusal = refuseVoucherClaim({
    offer,
    allowance: await voucherAllowance(admin, phone, offer),
    wanted: quantity,
    onSale: !!liveOffer,
  });
  if (refusal) {
    return NextResponse.json({ error: refusal.message, reason: refusal.reason }, { status: 409 });
  }

  // The price is the catalogue's, never the request's.
  const { data: product } = await admin
    .from("products")
    .select("id, name, price_myr")
    .eq("id", offer.productId)
    .maybeSingle();
  if (!product) {
    return NextResponse.json({ error: "Could not find the voucher in the catalogue." }, { status: 500 });
  }
  const unit = Number(product.price_myr);
  const total = Math.round(unit * quantity * 100) / 100;

  const found = await findOrCreateCustomer(admin, { name, phone, source: "Walk-in" });
  if (!found) {
    return NextResponse.json({ error: "Could not add that customer. Please try again." }, { status: 500 });
  }
  const { customer } = found;

  const actor = staff.email ?? "staff";
  const now = new Date().toISOString();

  const { data: purchase, error: purchaseError } = await admin
    .from("purchases")
    .insert({
      signup_id: customer.id,
      product_name: quantity > 1 ? `${quantity}× ${product.name}` : product.name,
      amount_myr: total,
      payment_method: method,
      status: "confirmed",
    })
    .select("id")
    .single();
  if (purchaseError || !purchase) {
    return NextResponse.json({ error: "Could not record the sale. Nothing was saved." }, { status: 500 });
  }

  // Like the online route, a missing line item does not undo the sale: the
  // header already carries the total.
  const { error: itemError } = await admin.from("order_items").insert({
    purchase_id: purchase.id,
    product_id: product.id,
    product_name: product.name,
    quantity,
    unit_price_myr: unit,
    line_total_myr: total,
  });
  if (itemError) console.error("walk-in order_items insert failed:", itemError.message);

  // ONE ROW PER VOUCHER, unattached: the cap counts rows, and no slot means
  // nothing is booked against them yet.
  const { data: vouchers, error: voucherError } = await admin
    .from("vouchers")
    .insert(
      Array.from({ length: quantity }, () => ({
        signup_id: customer.id,
        phone_normalised: phoneKeyFor(phone),
        offer_id: offer.id,
        product_id: product.id,
        price_myr: unit,
        status: "paid",
        paid_at: now,
        expires_on: offer.redeemByISO,
        purchase_id: null,
        notes: `Walk-in sale recorded by ${actor}.`,
      })),
    )
    .select("id");

  if (voucherError || !vouchers?.length) {
    // The money would be on a purchase with no voucher to show for it. Take the
    // purchase back out so nothing half-recorded is left to puzzle over.
    console.error("walk-in voucher insert failed:", voucherError?.message);
    await admin.from("order_items").delete().eq("purchase_id", purchase.id);
    await admin.from("purchases").delete().eq("id", purchase.id);
    return NextResponse.json({ error: "Could not record the vouchers. Nothing was saved." }, { status: 500 });
  }

  const supabase = await createClient();
  if (found.created) {
    await logActivity(supabase, {
      entity_type: "signup",
      entity_id: customer.id,
      action: "signup_created",
      actor,
      metadata: { source: "walk_in_voucher" },
    });
  }
  await logActivity(supabase, {
    entity_type: "purchase",
    entity_id: purchase.id,
    action: "walk_in_voucher_sold",
    actor,
    metadata: { quantity, payment_method: method },
  });
  await logAudit(supabase, {
    table_name: "purchases",
    row_id: purchase.id,
    operation: "INSERT",
    new_data: { signup_id: customer.id, amount_myr: total, status: "confirmed", payment_method: method },
    actor,
  });

  return NextResponse.json(
    {
      ok: true,
      purchase_id: purchase.id,
      quantity,
      total,
      customer: { name: customer.name, customer_no: customer.customer_no, created: found.created },
    },
    { status: 201 },
  );
}
