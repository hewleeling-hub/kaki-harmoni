import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity, logAudit } from "@/lib/activity";
import { scoreLead } from "@/lib/scoring";
import { sendSalesAlert, purchaseConfirmedEmail } from "@/lib/email";
import { DOOR_SURCHARGE_MYR } from "@/lib/config";

// Legacy default used when no items are sent or the catalogue isn't available yet.
const DEFAULT_ITEM_NAME = "First Visit — Foot Soak + Coffee";
const DEFAULT_ITEM_PRICE_MYR = 25.0;

type ResolvedLine = {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price_myr: number;
  line_total_myr: number;
};

// Resolve requested items against the catalogue, pricing every line from the DB
// (never trusting client-sent prices). Falls back to the legacy single item.
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
      .select("id, name, price_myr, active")
      .in("id", ids);

    if (products && products.length > 0) {
      const byId = new Map(products.map((p) => [p.id, p]));
      const lines: ResolvedLine[] = [];
      for (const req of requested) {
        const p = byId.get(req.product_id as string);
        if (!p || p.active === false) continue;
        const quantity = Math.min(Math.max(Math.floor(req.quantity as number), 1), 20);
        const unit = Number(p.price_myr);
        lines.push({
          product_id: p.id,
          product_name: p.name,
          quantity,
          unit_price_myr: unit,
          line_total_myr: Math.round(unit * quantity * 100) / 100,
        });
      }
      if (lines.length > 0) return lines;
    }
  }

  // Fallback: legacy single first-visit item.
  return [
    {
      product_id: null,
      product_name: DEFAULT_ITEM_NAME,
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

  if (signup.status === "converted") {
    return NextResponse.json(
      { error: "You've already completed your purchase. Thank you!", already_converted: true },
      { status: 409 },
    );
  }

  const lines = await resolveLines(supabase, body.items);
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
