import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity, logAudit } from "@/lib/activity";
import { scoreLead } from "@/lib/scoring";
import { sendSalesAlert, purchaseConfirmedEmail } from "@/lib/email";
import { DOOR_SURCHARGE_MYR } from "@/lib/config";
import { MAX_CAPACITY_PER_SLOT } from "@/lib/slots";
import { hasBookedBefore } from "@/lib/customer";
import { FIRST_VISIT_PRODUCT_ID, PACKAGES_ARE_PREPAY_ONLY } from "@/config/catalogue";

// Legacy default used when no items are sent or the catalogue isn't available yet.
const DEFAULT_ITEM_NAME = "First Visit — Foot Soak + Coffee";
const DEFAULT_ITEM_PRICE_MYR = 25.0;

type ResolvedLine = {
  product_id: string | null;
  product_name: string;
  category: string;
  quantity: number;
  unit_price_myr: number;
  line_total_myr: number;
};

/** Services and packages are the thing being bought; add-ons ride along. */
const isMainCategory = (category: string) => category === "service" || category === "package";

// Resolve requested items against the catalogue, pricing every line from the DB
// (never trusting client-sent prices). Falls back to the legacy single item.
//
// The shape is enforced here, not just in the form: exactly one main item at
// quantity 1 (one booking holds one place in the slot, and the FAQ tells a pair
// to book a soak each), plus any number of add-ons at 1–20.
async function resolveLines(
  supabase: ReturnType<typeof createAdminClient>,
  items: { product_id?: string; quantity?: number }[] | undefined,
): Promise<ResolvedLine[]> {
  const requested = (items ?? []).filter(
    (i) => i.product_id && (i.quantity ?? 0) > 0,
  );

  if (requested.length > 0) {
    const ids = requested.map((i) => i.product_id as string);
    const { data: products } = await supabase
      .from("products")
      .select("id, name, price_myr, active, category")
      .in("id", ids);

    if (products && products.length > 0) {
      const byId = new Map(products.map((p) => [p.id, p]));
      const lines: ResolvedLine[] = [];
      let mainTaken = false;

      for (const req of requested) {
        const p = byId.get(req.product_id as string);
        if (!p || p.active === false) continue;

        const category = String(p.category ?? "service");
        const main = isMainCategory(category);
        // Ignore a second main item rather than silently charging for both.
        if (main && mainTaken) continue;
        if (main) mainTaken = true;

        const quantity = main
          ? 1
          : Math.min(Math.max(Math.floor(req.quantity as number), 1), 20);
        const unit = Number(p.price_myr);
        lines.push({
          product_id: p.id,
          product_name: p.name,
          category,
          quantity,
          unit_price_myr: unit,
          line_total_myr: Math.round(unit * quantity * 100) / 100,
        });
      }
      // Add-ons alone are not a booking — fall through to the default visit.
      if (mainTaken) return lines;
    }
  }

  // Fallback: legacy single first-visit item.
  return [
    {
      product_id: null,
      product_name: DEFAULT_ITEM_NAME,
      category: "service",
      quantity: 1,
      unit_price_myr: DEFAULT_ITEM_PRICE_MYR,
      line_total_myr: DEFAULT_ITEM_PRICE_MYR,
    },
  ];
}

function summarise(lines: ResolvedLine[]): string {
  if (lines.length === 1) {
    const l = lines[0];
    return l.quantity > 1 ? `${l.quantity}× ${l.product_name}` : l.product_name;
  }
  return `${lines[0].product_name} +${lines.length - 1} more`;
}

export async function POST(request: NextRequest) {
  let body: {
    signup_id?: string;
    payment_method?: string;
    pay_timing?: string;
    items?: { product_id?: string; quantity?: number }[];
    slot_date?: string;
    slot_time?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const signup_id = body.signup_id;
  const payTiming = body.pay_timing === "door" ? "door" : "prepay";
  const payment_method = body.payment_method?.trim() || "online_transfer";

  if (!signup_id) {
    return NextResponse.json({ error: "Missing signup." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: signup, error: signupError } = await supabase
    .from("signups")
    .select("*")
    .eq("id", signup_id)
    .maybeSingle();

  if (signupError || !signup) {
    return NextResponse.json({ error: "Signup not found." }, { status: 404 });
  }

  // Repeat visits are the whole proposition — the routine ladder only means
  // anything if a guest can come back — so a converted signup is no longer
  // turned away here. The one thing that does NOT repeat is the discounted
  // first visit, enforced once the lines are priced below.
  const isReturning = await hasBookedBefore(supabase, signup);

  // The slot is chosen BEFORE payment, so it arrives with the purchase and is
  // written on the same row. Nothing holds it in between — re-check capacity
  // here, because someone else may have paid for the last place meanwhile.
  const slot_date = body.slot_date?.trim() || null;
  const slot_time = body.slot_time?.trim() || null;

  if (slot_date && slot_time) {
    const { count } = await supabase
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .eq("booking_date", slot_date)
      .eq("booking_time", slot_time);

    if ((count ?? 0) >= MAX_CAPACITY_PER_SLOT) {
      return NextResponse.json(
        { error: "That time slot just filled up. Please pick another.", slot_taken: true },
        { status: 409 },
      );
    }
  }

  const lines = await resolveLines(supabase, body.items);

  // Off by default — packages are settled at the shop, so refusing
  // pay-at-the-door here would contradict the site's own instruction. Kept as
  // a switch: carrying an unpaid RM840 routine through to the
  // day is a real loss if the guest doesn't arrive, where an unpaid RM30 first
  // visit is not. The form doesn't offer the choice; this is what enforces it.
  // The first visit is priced below the standard single as an acquisition
  // offer, so it is available once per person. The checkout doesn't show it to
  // a returning guest; this is what makes that a rule rather than a hint.
  // `product_id === null` catches the legacy fallback line, which IS the RM25
  // first visit under another name. Without that clause a returning guest whose
  // options came back empty would fall through to it and be charged the
  // introductory price again, every visit.
  const isFirstVisitLine = (l: { product_id: string | null }) =>
    l.product_id === FIRST_VISIT_PRODUCT_ID || l.product_id === null;

  if (isReturning && lines.some(isFirstVisitLine)) {
    return NextResponse.json(
      {
        error:
          "The first-visit price is for your first soak with us. Please pick another option — welcome back!",
        first_visit_used: true,
      },
      { status: 409 },
    );
  }

  const hasPackage = lines.some((l) => l.category === "package");
  if (PACKAGES_ARE_PREPAY_ONLY && hasPackage && payTiming === "door") {
    return NextResponse.json(
      {
        error:
          "Packages are prepaid — please choose prepay, or pick a single visit to pay at the door.",
      },
      { status: 400 },
    );
  }

  const subtotal = lines.reduce((sum, l) => sum + l.line_total_myr, 0);
  // Pay-at-the-door adds a small surcharge; prepaying is the cheaper option.
  const surcharge = payTiming === "door" ? DOOR_SURCHARGE_MYR : 0;
  const orderTotal = Math.round((subtotal + surcharge) * 100) / 100;

  // Nothing is actually collected at the moment of checkout — cash is paid in person at the
  // visit, and transfer/e-wallet need staff to verify receipt. Everything starts pending;
  // staff flips it to 'confirmed' via the dashboard once money is actually in hand.
  const paymentStatus = "pending_payment";

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      signup_id,
      product_name: summarise(lines),
      amount_myr: orderTotal,
      payment_method,
      status: paymentStatus,
      booking_date: slot_date,
      booking_time: slot_time,
    })
    .select()
    .single();

  if (purchaseError || !purchase) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  // Persist line items. If the table doesn't exist yet (migration not applied),
  // the order still records its total on the header — don't fail the purchase.
  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((l) => ({
      purchase_id: purchase.id,
      product_id: l.product_id,
      product_name: l.product_name,
      quantity: l.quantity,
      unit_price_myr: l.unit_price_myr,
      line_total_myr: l.line_total_myr,
    })),
  );
  if (itemsError) {
    console.error("order_items insert failed (is migration 0006 applied?):", itemsError.message);
  }

  const hoursToPurchase =
    (Date.now() - new Date(signup.created_at).getTime()) / (1000 * 60 * 60);

  const score = scoreLead({
    referralSource: signup.referral_source,
    hasPhone: !!signup.phone,
    hoursToPurchase,
  });

  const { data: updatedSignup, error: updateError } = await supabase
    .from("signups")
    .update({
      status: "converted",
      lead_score: score.lead_score,
      lead_score_source: score.lead_score_source,
      lead_score_confidence: score.lead_score_confidence,
    })
    .eq("id", signup_id)
    .select()
    .single();

  if (updateError || !updatedSignup) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  await logActivity(supabase, {
    entity_type: "purchase",
    entity_id: purchase.id,
    action: "purchase_confirmed",
    actor: "public_form",
    metadata: { amount_myr: orderTotal, items: lines.length, pay_timing: payTiming, signup_id },
  });
  await logAudit(supabase, {
    table_name: "purchases",
    row_id: purchase.id,
    operation: "INSERT",
    new_data: purchase,
    actor: "public_form",
  });
  await logActivity(supabase, {
    entity_type: "signup",
    entity_id: signup_id,
    action: "lead_scored",
    actor: "score_lead",
    metadata: score.inputs,
  });
  await logAudit(supabase, {
    table_name: "signups",
    row_id: signup_id,
    operation: "UPDATE",
    old_data: signup,
    new_data: updatedSignup,
    actor: "score_lead",
  });

  const alert = purchaseConfirmedEmail({
    name: signup.name,
    email: signup.email,
    amount: orderTotal,
    paymentMethod: payment_method,
  });
  sendSalesAlert(alert.subject, alert.html); // fire-and-forget, never blocks the response

  return NextResponse.json({ purchase, signup: updatedSignup }, { status: 201 });
}
