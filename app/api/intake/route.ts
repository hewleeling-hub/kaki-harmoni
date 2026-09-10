import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import {
  HEALTH_CONDITIONS,
  HEALTH_GOALS,
  AROMA_OILS,
  SPA_SALTS,
  WATER_LEVELS,
  WATER_TEMPS,
  INTENSITIES,
  DURATIONS,
  INTAKE_SCAN_BUCKET,
  INTAKE_SCAN_TYPES,
  INTAKE_SCAN_MAX_BYTES,
  INTAKE_COLUMNS,
} from "@/config/intake";

/**
 * Intake records — staff only, every route in this file.
 *
 * The scan is the consent record and these fields are the searchable half.
 * Both are as sensitive as anything in this app: health answers and an IC or
 * passport number. So the table is reached only through the service-role
 * client, behind requireStaff(), and the browser is never given a route to it.
 *
 * Multipart rather than JSON: the scan arrives with the fields in one request,
 * so a record can't end up saved with its signed form missing because a second
 * call failed.
 */

const MAX_TEXT = 2000;

type IntakeSignupRow = {
  id: string;
  name: string | null;
  phone: string | null;
  customer_no: number | null;
};

const clean = (value: FormDataEntryValue | null, max = MAX_TEXT): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
};

/** Only ever a value from the known list, never what the request asked for. */
const one = (value: FormDataEntryValue | null, allowed: readonly string[]): string | null => {
  const v = clean(value, 60);
  return v && allowed.includes(v) ? v : null;
};

const many = (values: FormDataEntryValue[], allowed: readonly string[]): string[] =>
  allowed.filter((option) => values.includes(option));

/**
 * The forms on file. With `customer_no`, just that one person's.
 *
 * Keyed on the customer number rather than the signup row, because a person and
 * a signup row are not the same thing. Signups dedupe on email, so somebody who
 * comes back and signs up again without one has two rows — and their history
 * would be split in half by a signup_id lookup, which is exactly the visit you
 * need when they are standing at the counter. `customer_no` is shared across
 * every row belonging to that phone number (see 0015), so it finds all of it.
 */
export async function GET(request: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const supabase = createAdminClient();

  const rawCustomerNo = request.nextUrl.searchParams.get("customer_no");
  let signupIds: string[] | null = null;

  if (rawCustomerNo !== null) {
    const customerNo = Number.parseInt(rawCustomerNo, 10);
    if (!Number.isInteger(customerNo) || customerNo < 1) {
      return NextResponse.json({ error: "Not a customer number." }, { status: 400 });
    }

    const { data: rows } = await supabase
      .from("signups")
      .select("id")
      .eq("customer_no", customerNo);

    signupIds = (rows ?? []).map((row) => row.id as string);

    // No rows means nobody holds that number — an empty history, not everyone's.
    if (signupIds.length === 0) return NextResponse.json({ forms: [] });
  }

  let query = supabase.from("spa_survey_forms").select(INTAKE_COLUMNS);
  if (signupIds) query = query.in("signup_id", signupIds);

  const { data, error } = await query.order("created_at", { ascending: false }).limit(200);

  if (error) {
    // The table exists in production but 0018 adds columns this reads.
    console.error("intake list failed (is migration 0018 applied?):", error.message);
    return NextResponse.json({ error: "Could not load intake forms.", forms: [] }, { status: 500 });
  }

  return NextResponse.json({ forms: data ?? [] });
}

export async function POST(request: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const signupId = clean(form.get("signup_id"), 60);
  let signup: IntakeSignupRow | null = null;

  if (signupId) {
    const { data } = await supabase
      .from("signups")
      .select("id, name, phone, customer_no")
      .eq("id", signupId)
      .maybeSingle();
    signup = data as IntakeSignupRow | null;
    if (!signup) {
      return NextResponse.json({ error: "That customer no longer exists." }, { status: 404 });
    }
  }

  // ── The scan ──────────────────────────────────────────────────────────────
  // Optional: a form can be keyed in first and the scan added once the sheet
  // reaches the scanner. Type and size are checked here as well as on the
  // bucket, because the bucket's limits only apply if 0019 has been run.
  let scanPath: string | null = null;
  const file = form.get("scan");

  if (file instanceof File && file.size > 0) {
    if (!(INTAKE_SCAN_TYPES as readonly string[]).includes(file.type)) {
      return NextResponse.json(
        { error: "That file type isn't supported — use a photo or a PDF." },
        { status: 400 },
      );
    }
    if (file.size > INTAKE_SCAN_MAX_BYTES) {
      return NextResponse.json(
        { error: "That file is too large. Please use a smaller scan or photo." },
        { status: 400 },
      );
    }

    // Foldered by date so a year of scans stays navigable in the Supabase UI,
    // and named with a random id rather than the guest's name — object paths
    // turn up in logs, and a name plus "intake" is more than a log needs.
    const today = new Date().toISOString().slice(0, 10);
    const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase().slice(0, 8) : "bin";
    scanPath = `${today}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(INTAKE_SCAN_BUCKET)
      .upload(scanPath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error(
        `intake scan upload failed (does the "${INTAKE_SCAN_BUCKET}" bucket exist? see migration 0019):`,
        uploadError.message,
      );
      return NextResponse.json(
        { error: "Could not upload that scan. The record was not saved." },
        { status: 500 },
      );
    }
  }

  const record = {
    signup_id: signup?.id ?? null,
    guest_name: clean(form.get("guest_name"), 120) ?? signup?.name ?? null,
    contact_no: clean(form.get("contact_no"), 40) ?? signup?.phone ?? null,
    ic_passport_no: clean(form.get("ic_passport_no"), 40),
    voucher_no: clean(form.get("voucher_no"), 40),
    sponsor_name: clean(form.get("sponsor_name"), 120),
    survey_date: clean(form.get("survey_date"), 10) ?? new Date().toISOString().slice(0, 10),

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

    scan_path: scanPath,
    scan_uploaded_at: scanPath ? new Date().toISOString() : null,
    status: "complete",
    completed_at: new Date().toISOString(),
  };

  const { data: saved, error } = await supabase
    .from("spa_survey_forms")
    .insert(record)
    .select("id")
    .single();

  if (error || !saved) {
    // Don't leave an orphan image in the bucket if the row didn't land.
    if (scanPath) {
      await supabase.storage.from(INTAKE_SCAN_BUCKET).remove([scanPath]);
    }
    console.error("intake save failed (is migration 0018 applied?):", error?.message);
    return NextResponse.json({ error: "Could not save that." }, { status: 500 });
  }

  await logActivity(supabase, {
    entity_type: "signup",
    entity_id: signup?.id ?? saved.id,
    action: "intake_recorded",
    actor: user.email ?? "staff",
    // Deliberately NOT the answers. Activity rows are read all over the
    // dashboard; health information belongs in one place only.
    metadata: { intake_id: saved.id, has_scan: !!scanPath },
  });

  return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
}
