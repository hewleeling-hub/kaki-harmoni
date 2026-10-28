import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity, logAudit } from "@/lib/activity";
import { phoneKeyFor } from "@/lib/customer";
import { voucherAllowance, refuseVoucherClaim } from "@/lib/vouchers";
import { activeVoucherOffer, ELEVEN_ELEVEN } from "@/config/promotions";

/**
 * Voucher claims.
 *
 * A claim RESERVES vouchers against a mobile number; it does not take money.
 * Payment happens on WhatsApp or at the counter, where it already happens
 * today, and staff mark the row paid. That split is deliberate: the poster's
 * cap is the thing that needed enforcing, and reserving is enough to enforce
 * it. Taking card payment here would have meant building refunds for a RM11
 * line before the offer could go live at all.
 */

/** GET /api/vouchers?phone=...  — how many this number may still take. */
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");
  const offer = activeVoucherOffer() ?? ELEVEN_ELEVEN;
  const supabase = createAdminClient();
  const allowance = await voucherAllowance(supabase, phone, offer);

  return NextResponse.json({
    on_sale: !!activeVoucherOffer(),
    held: allowance.held,
    remaining: allowance.remaining,
    max: allowance.max,
  });
}

export async function POST(request: NextRequest) {
  let body: { name?: string; phone?: string; quantity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const wanted = Number(body.quantity ?? 1);

  if (!name) {
    return NextResponse.json({ error: "Please tell us your name.", field: "name" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json(
      { error: "Please give us a mobile number — the limit is counted per number.", field: "phone" },
      { status: 400 },
    );
  }
  const phoneKey = phoneKeyFor(phone);
  if (!phoneKey) {
    return NextResponse.json(
      { error: "That mobile number doesn't look right. Please check it.", field: "phone" },
      { status: 400 },
    );
  }
  if (!Number.isInteger(wanted) || wanted < 1) {
    return NextResponse.json({ error: "Please choose how many vouchers.", field: "quantity" }, { status: 400 });
  }

  const supabase = createAdminClient();

  /* The sale window and the cap are both checked HERE, not only in the form.
     The page hides what isn't available, but a stale tab left open past the
     11th, or a hand-made request, would otherwise walk straight past that —
     the same reasoning as the promotion-day checks in /api/purchases. */
  const live = activeVoucherOffer();
  const offer = live ?? ELEVEN_ELEVEN;
  const allowance = await voucherAllowance(supabase, phone, offer);

  const refusal = refuseVoucherClaim({ offer, allowance, wanted, onSale: !!live });
  if (refusal) {
    return NextResponse.json(
      { error: refusal.message, reason: refusal.reason, held: allowance.held, remaining: allowance.remaining },
      { status: 409 },
    );
  }

  /* The price comes from the catalogue, never from the offer copy. A price
     written into a page is a price the server never checks. */
  const { data: product } = await supabase
    .from("products")
    .select("id, price_myr")
    .eq("id", offer.productId)
    .maybeSingle();

  if (!product) {
    return NextResponse.json(
      { error: "That offer isn't available right now. Please message us and we'll sort it out." },
      { status: 503 },
    );
  }

  /* One person, one signup row where we can manage it: reuse the row this
     number already has rather than creating a second identity for the same
     human. Same lookup the signups route uses. */
  const { data: known } = await supabase
    .from("signups")
    .select("id, customer_no")
    .eq("phone_normalised", phoneKey)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let signupId = known?.id as string | undefined;

  if (!signupId) {
    const { data: created, error: signupError } = await supabase
      .from("signups")
      .insert({
        name,
        phone,
        phone_normalised: phoneKey,
        referral_source: "11.11 voucher",
        status: "signed_up",
      })
      .select("id")
      .single();

    if (signupError || !created) {
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
    signupId = created.id as string;
  }

  const rows = Array.from({ length: wanted }, () => ({
    signup_id: signupId,
    phone_normalised: phoneKey,
    offer_id: offer.id,
    product_id: product.id,
    price_myr: product.price_myr,
    status: "reserved",
    expires_on: offer.redeemByISO,
  }));

  const { data: vouchers, error } = await supabase.from("vouchers").insert(rows).select("id");

  if (error || !vouchers) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  for (const v of vouchers) {
    await logActivity(supabase, {
      entity_type: "voucher",
      entity_id: v.id,
      action: "voucher_reserved",
      actor: "public_form",
      metadata: { offer_id: offer.id, price_myr: product.price_myr },
    });
    await logAudit(supabase, {
      table_name: "vouchers",
      row_id: v.id,
      operation: "INSERT",
      new_data: { signup_id: signupId, offer_id: offer.id, status: "reserved" },
      actor: "public_form",
    });
  }

  const after = await voucherAllowance(supabase, phone, offer);

  return NextResponse.json(
    {
      claimed: vouchers.length,
      held: after.held,
      remaining: after.remaining,
      max: after.max,
      expires_on: offer.redeemByISO,
      redeem_by: offer.redeemByLabel,
      /* Something short the customer can quote and staff can match a DuitNow
         transfer against — the same first-eight-of-the-uuid shape the booking
         reference already uses, so the counter reads one kind of reference. */
      reference: String(vouchers[0].id).slice(0, 8).toUpperCase(),
      amount_myr: Number(product.price_myr) * vouchers.length,
    },
    { status: 201 },
  );
}
