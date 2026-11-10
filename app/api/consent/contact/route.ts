import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { logActivity, logAudit } from "@/lib/activity";
import { findOrCreateCustomer, phoneKeyFor, recordMarketingConsent } from "@/lib/customer";

// POST /api/consent/contact { name, phone, confirmed } — add somebody who is not a
// customer yet but has asked, on WhatsApp, to hear about our specials (staff only).
//
// They go into the same customer list as everyone else, already marked as agreed
// with "whatsapp" as the source, so they appear under Agreed on the consent page
// and on any list built from it. Nothing is sent to them here.
//
// The proof of the yes is the WhatsApp conversation itself, which this system
// does not hold — so `confirmed` must be true: the person adding them is stating
// that the message exists. That statement and who made it go in the activity log.
//
// A number that is already on file is not duplicated: the existing person is
// marked as agreed instead, the same way every other form matches on phone.

export async function POST(request: NextRequest) {
  const staff = await requireStaff();
  if (!staff) return NextResponse.json({ error: "Staff only." }, { status: 401 });

  let body: { name?: string; phone?: string; confirmed?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim().slice(0, 120);
  const phone = body.phone?.trim().slice(0, 40);
  if (!name) return NextResponse.json({ error: "Enter their name." }, { status: 400 });
  if (!phone || !phoneKeyFor(phone)) {
    return NextResponse.json({ error: "Enter a phone number we can message." }, { status: 400 });
  }
  if (body.confirmed !== true) {
    return NextResponse.json(
      { error: "Only add someone who has agreed — tick the box to confirm you have their WhatsApp message." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const found = await findOrCreateCustomer(admin, { name, phone, source: "WhatsApp" });
  if (!found) {
    return NextResponse.json({ error: "Could not add that contact. Please try again." }, { status: 500 });
  }
  const { customer, created } = found;

  // Already agreed? Then there is nothing to change and nothing to log.
  let alreadyAgreed = false;
  if (!created && customer.customer_no != null) {
    const { count } = await admin
      .from("signups")
      .select("id", { count: "exact", head: true })
      .eq("customer_no", customer.customer_no)
      .eq("marketing_consent", true);
    alreadyAgreed = (count ?? 0) > 0;
  }

  const actor = staff.email ?? "staff";
  const supabase = await createClient();

  if (!alreadyAgreed) {
    const ok = await recordMarketingConsent(admin, customer.id, "whatsapp");
    if (!ok) {
      return NextResponse.json({ error: "Could not save that. Nothing was changed." }, { status: 500 });
    }
    if (created) {
      await logActivity(supabase, {
        entity_type: "signup",
        entity_id: customer.id,
        action: "signup_created",
        actor,
        metadata: { source: "whatsapp_enquiry" },
      });
    }
    await logActivity(supabase, {
      entity_type: "signup",
      entity_id: customer.id,
      action: "marketing_consent_recorded",
      actor,
      metadata: { source: "whatsapp", confirmed_message_on_file: true },
    });
    await logAudit(supabase, {
      table_name: "signups",
      row_id: customer.id,
      operation: "UPDATE",
      old_data: { marketing_consent: false },
      new_data: { marketing_consent: true },
      actor,
    });
  }

  return NextResponse.json(
    { ok: true, created, already_agreed: alreadyAgreed, customer: { name: customer.name, customer_no: customer.customer_no } },
    { status: 201 },
  );
}
