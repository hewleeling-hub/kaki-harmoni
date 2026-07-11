import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity, logAudit } from "@/lib/activity";
import { scoreLead } from "@/lib/scoring";

const PRODUCT_NAME = "First Visit — Foot Soak + Coffee";
const PRODUCT_PRICE_MYR = 25.0;

export async function POST(request: NextRequest) {
  let body: { signup_id?: string; payment_method?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const signup_id = body.signup_id;
  const payment_method = body.payment_method?.trim() || "online_transfer";

  if (!signup_id) {
    return NextResponse.json({ error: "Missing signup." }, { status: 400 });
  }

  const supabase = await createClient();

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

  // Nothing is actually collected at the moment of checkout — cash is paid in person at the
  // visit, and transfer/e-wallet need staff to verify receipt. Everything starts pending;
  // staff flips it to 'confirmed' via the dashboard once money is actually in hand.
  const paymentStatus = "pending_payment";

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      signup_id,
      product_name: PRODUCT_NAME,
      amount_myr: PRODUCT_PRICE_MYR,
      payment_method,
      status: paymentStatus,
    })
    .select()
    .single();

  if (purchaseError || !purchase) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
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
    metadata: { amount_myr: PRODUCT_PRICE_MYR, signup_id },
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

  return NextResponse.json({ purchase, signup: updatedSignup }, { status: 201 });
}
