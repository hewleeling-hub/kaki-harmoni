import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity, logAudit } from "@/lib/activity";
import { requireStaff } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaff();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  let body: { status?: string; visit_status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: before } = await supabase.from("purchases").select("*").eq("id", id).maybeSingle();
  if (!before) {
    return NextResponse.json({ error: "Purchase not found." }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (body.status && ["pending_payment", "confirmed"].includes(body.status)) {
    updates.status = body.status;
  }
  if (body.visit_status && ["upcoming", "attended", "no_show"].includes(body.visit_status)) {
    updates.visit_status = body.visit_status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from("purchases")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  await logActivity(supabase, {
    entity_type: "purchase",
    entity_id: id,
    action: "purchase_updated",
    actor: "sales_dashboard",
    metadata: updates,
  });
  await logAudit(supabase, {
    table_name: "purchases",
    row_id: id,
    operation: "UPDATE",
    old_data: before,
    new_data: updated,
    actor: "sales_dashboard",
  });

  return NextResponse.json({ purchase: updated });
}
