import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity, logAudit } from "@/lib/activity";
import { requireStaff } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaff();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: signup, error } = await supabase.from("signups").select("*").eq("id", id).maybeSingle();

  if (error || !signup) {
    return NextResponse.json({ error: "Signup not found." }, { status: 404 });
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("signup_id", id)
    .maybeSingle();

  return NextResponse.json({ signup, purchase: purchase ?? null });
}

const REVIEW_STATUSES = ["unreviewed", "approved", "flagged"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaff();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  let body: { name?: string; phone?: string; status?: string; review_status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: before } = await supabase.from("signups").select("*").eq("id", id).maybeSingle();
  if (!before) {
    return NextResponse.json({ error: "Signup not found." }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.phone === "string") updates.phone = body.phone.trim() || null;
  if (typeof body.status === "string" && ["signed_up", "converted"].includes(body.status)) {
    updates.status = body.status;
  }
  // Sprint 5: staff move a scored lead through review (unreviewed -> approved / flagged).
  if (typeof body.review_status === "string" && REVIEW_STATUSES.includes(body.review_status)) {
    updates.lead_score_review_status = body.review_status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const isReviewChange = "lead_score_review_status" in updates;

  const { data: signup, error } = await supabase
    .from("signups")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !signup) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  await logActivity(supabase, {
    entity_type: "signup",
    entity_id: id,
    action: isReviewChange ? "lead_review_updated" : "signup_updated",
    actor: "sales_dashboard",
    metadata: updates,
  });
  await logAudit(supabase, {
    table_name: "signups",
    row_id: id,
    operation: "UPDATE",
    old_data: before,
    new_data: signup,
    actor: "sales_dashboard",
  });

  return NextResponse.json({ signup });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaff();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: before } = await supabase.from("signups").select("*").eq("id", id).maybeSingle();
  if (!before) {
    return NextResponse.json({ error: "Signup not found." }, { status: 404 });
  }

  // Critical action (delete) — dashboard requires an explicit confirm dialog before calling this (docs/AGENTIC_LAYER.md)
  await supabase.from("purchases").delete().eq("signup_id", id);
  const { error } = await supabase.from("signups").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  await logActivity(supabase, {
    entity_type: "signup",
    entity_id: id,
    action: "signup_deleted",
    actor: "sales_dashboard",
  });
  await logAudit(supabase, {
    table_name: "signups",
    row_id: id,
    operation: "DELETE",
    old_data: before,
    actor: "sales_dashboard",
  });

  return NextResponse.json({ ok: true });
}
