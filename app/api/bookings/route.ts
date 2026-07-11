import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity, logAudit } from "@/lib/activity";
import { MAX_CAPACITY_PER_SLOT } from "@/lib/slots";

export async function POST(request: NextRequest) {
  let body: { purchase_id?: string; slot_date?: string; slot_time?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { purchase_id, slot_date, slot_time } = body;
  if (!purchase_id || !slot_date || !slot_time) {
    return NextResponse.json({ error: "Please choose a date and time." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: purchase } = await supabase.from("purchases").select("*").eq("id", purchase_id).maybeSingle();
  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found." }, { status: 404 });
  }

  const { count } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .eq("booking_date", slot_date)
    .eq("booking_time", slot_time);

  if ((count ?? 0) >= MAX_CAPACITY_PER_SLOT) {
    return NextResponse.json(
      { error: "That time slot just filled up. Please pick another." },
      { status: 409 },
    );
  }

  const { data: updated, error } = await supabase
    .from("purchases")
    .update({ booking_date: slot_date, booking_time: slot_time })
    .eq("id", purchase_id)
    .select()
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  await logActivity(supabase, {
    entity_type: "purchase",
    entity_id: purchase_id,
    action: "slot_booked",
    actor: "public_form",
    metadata: { slot_date, slot_time },
  });
  await logAudit(supabase, {
    table_name: "purchases",
    row_id: purchase_id,
    operation: "UPDATE",
    old_data: purchase,
    new_data: updated,
    actor: "public_form",
  });

  return NextResponse.json({ purchase: updated });
}
