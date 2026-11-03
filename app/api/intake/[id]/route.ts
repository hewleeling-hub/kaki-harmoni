import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { clean, one, many } from "@/lib/intake-fields";
import {
  HEALTH_CONDITIONS,
  HEALTH_GOALS,
  AROMA_OILS,
  SPA_SALTS,
  WATER_LEVELS,
  WATER_TEMPS,
  INTENSITIES,
  DURATIONS,
  INTAKE_COLUMNS,
} from "@/config/intake";

// PATCH /api/intake/[id] — correct a form that has already been filed (staff only).
//
// The edit panel submits every field, so what arrives is the whole corrected
// form: an unticked box really means "not ticked now", and a field emptied on
// screen is cleared. It does NOT touch the scan, the customer the form is filed
// against, or its status — correcting a typo must not move a signed consent
// record from one person to another, and the customer's own record is edited
// where the customer is, not here.
//
// The activity log records WHICH fields changed and never their values, like the
// rest of intake: health answers live in one place only.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: before } = await supabase
    .from("spa_survey_forms")
    .select(INTAKE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!before) return NextResponse.json({ error: "That form no longer exists." }, { status: 404 });
  const old = before as unknown as Record<string, unknown>;

  const date = clean(form.get("survey_date"), 10);
  if (date && !ISO_DATE.test(date)) {
    return NextResponse.json({ error: "That date isn't valid." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    guest_name: clean(form.get("guest_name"), 120),
    contact_no: clean(form.get("contact_no"), 40),
    ic_passport_no: clean(form.get("ic_passport_no"), 40),
    sponsor_name: clean(form.get("sponsor_name"), 120),
    voucher_no: clean(form.get("voucher_no"), 40),
    // A blank date keeps the one on file rather than erasing when the form was filled in.
    survey_date: date ?? (old.survey_date as string | null),

    health_conditions: many(form.getAll("health_conditions"), HEALTH_CONDITIONS),
    health_goals: many(form.getAll("health_goals"), HEALTH_GOALS),

    water_level: one(form.get("water_level"), WATER_LEVELS),
    water_temp: one(form.get("water_temp"), WATER_TEMPS),
    intensity: one(form.get("intensity"), INTENSITIES),
    duration_min: one(form.get("duration_min"), DURATIONS),
    aroma_oils: many(form.getAll("aroma_oils"), AROMA_OILS),
    recommended_oils: many(form.getAll("recommended_oils"), AROMA_OILS),
    salt_used: one(form.get("salt_used"), SPA_SALTS),
    recommended_salt: one(form.get("recommended_salt"), SPA_SALTS),

    server_name: clean(form.get("server_name"), 120),
    notes: clean(form.get("notes")),
  };

  const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  const changed = Object.keys(updates).filter((k) => !same(updates[k], old[k]));
  if (changed.length === 0) return NextResponse.json({ ok: true, changed: [] });

  const { data: saved, error } = await supabase
    .from("spa_survey_forms")
    .update(updates)
    .eq("id", id)
    .select(INTAKE_COLUMNS)
    .single();

  if (error || !saved) {
    console.error("intake update failed:", error?.message);
    return NextResponse.json({ error: "Could not save that." }, { status: 500 });
  }

  await logActivity(supabase, {
    entity_type: "signup",
    entity_id: (old.signup_id as string | null) ?? id,
    action: "intake_edited",
    actor: user.email ?? "staff",
    // Field NAMES only — never the answers.
    metadata: { intake_id: id, fields: changed },
  });

  return NextResponse.json({ ok: true, changed, form: saved });
}
