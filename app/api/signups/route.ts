import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity, logAudit } from "@/lib/activity";
import { scoreLead } from "@/lib/scoring";

export async function GET() {
  const supabase = await createClient();

  const { data: signups, error } = await supabase
    .from("signups")
    .select("*")
    .order("lead_score", { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: "Could not load signups." }, { status: 500 });
  }

  const { data: purchases } = await supabase.from("purchases").select("*");

  return NextResponse.json({ signups: signups ?? [], purchases: purchases ?? [] });
}

export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; phone?: string; referral_source?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const phone = body.phone?.trim() || null;
  const referral_source = body.referral_source?.trim() || null;

  if (!name) {
    return NextResponse.json({ error: "Name is required.", field: "name" }, { status: 400 });
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    return NextResponse.json({ error: "A valid email is required.", field: "email" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("signups")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "This email is already registered.", field: "email" },
      { status: 409 },
    );
  }

  const score = scoreLead({ referralSource: referral_source, hasPhone: !!phone, hoursToPurchase: null });

  const { data: signup, error } = await supabase
    .from("signups")
    .insert({
      name,
      email,
      phone,
      referral_source,
      status: "signed_up",
      lead_score: score.lead_score,
      lead_score_source: score.lead_score_source,
      lead_score_confidence: score.lead_score_confidence,
      lead_score_review_status: "unreviewed",
    })
    .select()
    .single();

  if (error || !signup) {
    // Unique index race condition -> treat as duplicate
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "This email is already registered.", field: "email" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  await logActivity(supabase, {
    entity_type: "signup",
    entity_id: signup.id,
    action: "signup_created",
    actor: "public_form",
    metadata: { referral_source },
  });
  await logAudit(supabase, {
    table_name: "signups",
    row_id: signup.id,
    operation: "INSERT",
    new_data: signup,
    actor: "public_form",
  });

  return NextResponse.json({ signup }, { status: 201 });
}
