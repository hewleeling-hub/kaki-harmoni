import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity";
import { referralOptions } from "@/config/business";

/**
 * Records "how did you hear about us?" from the confirmation page.
 *
 * PUBLIC by necessity — the person answering has just signed up and has no
 * account — so it is deliberately the narrowest endpoint on the site:
 *
 *  - it writes ONE column, `referral_source`, and nothing else;
 *  - the value must be one of `referralOptions`, so a request body cannot put
 *    arbitrary text into a field staff read;
 *  - it only fills a blank. Once answered, the answer is fixed, so a stale tab
 *    or a guessed id can't overwrite what somebody actually said.
 *
 * The worst a malicious caller can do with a valid signup id is set one
 * analytics field on a record that has none. The sibling PATCH on
 * /api/signups/[id] stays staff-only and is untouched.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: { referral_source?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const value = body.referral_source;
  if (!value || !(referralOptions as readonly string[]).includes(value)) {
    return NextResponse.json({ error: "Unknown option." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: signup } = await supabase
    .from("signups")
    .select("id, referral_source")
    .eq("id", id)
    .maybeSingle();

  if (!signup) {
    return NextResponse.json({ error: "Signup not found." }, { status: 404 });
  }

  // Already answered: succeed quietly rather than 409. The person tapping has
  // done nothing wrong — a double tap or a reloaded tab shouldn't show them an
  // error about a field they can't see.
  if (signup.referral_source) {
    return NextResponse.json({ ok: true, alreadyAnswered: true });
  }

  const { error } = await supabase
    .from("signups")
    .update({ referral_source: value })
    .eq("id", id)
    // Belt and braces against two taps racing: the second matches no row.
    .is("referral_source", null);

  if (error) {
    return NextResponse.json({ error: "Could not save that." }, { status: 500 });
  }

  await logActivity(supabase, {
    entity_type: "signup",
    entity_id: id,
    action: "referral_recorded",
    actor: "public_form",
    metadata: { referral_source: value },
  });

  return NextResponse.json({ ok: true });
}
