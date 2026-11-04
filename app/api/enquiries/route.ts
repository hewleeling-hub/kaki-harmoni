import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth";
import { logActivity, logAudit } from "@/lib/activity";
import { phoneKeyFor, customerRef } from "@/lib/customer";
import { scoreLead } from "@/lib/scoring";
import { ENQUIRY_STATUS, ENQUIRY_FOLLOWED_UP, isEnquiryStatus } from "@/lib/enquiry";

export async function GET() {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("signups")
    .select("id, created_at, name, phone, referral_source, status, customer_no")
    .like("status", "enquiry%")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Could not load enquiries." }, { status: 500 });

  const enquiries = rows ?? [];

  // When each was last followed up: the newest status change to followed_up.
  const lastFollowUp: Record<string, string> = {};
  const followedIds = enquiries.filter((e) => e.status === ENQUIRY_FOLLOWED_UP).map((e) => e.id);
  if (followedIds.length) {
    const { data: acts } = await supabase
      .from("activities")
      .select("entity_id, created_at, metadata")
      .in("entity_id", followedIds)
      .eq("action", "signup_updated")
      .order("created_at", { ascending: false });
    for (const a of acts ?? []) {
      if ((a.metadata as { status?: string } | null)?.status === ENQUIRY_FOLLOWED_UP && !lastFollowUp[a.entity_id]) {
        lastFollowUp[a.entity_id] = a.created_at;
      }
    }
  }

  // The ad's real result: of everyone logged as an enquiry, how many went on to book.
  const { data: created } = await supabase
    .from("activities")
    .select("entity_id")
    .eq("action", "enquiry_created");
  const createdIds = [...new Set((created ?? []).map((a) => a.entity_id as string))];
  let booked = 0;
  if (createdIds.length) {
    const { data: now } = await supabase.from("signups").select("id, status").in("id", createdIds);
    booked = (now ?? []).filter((s) => !isEnquiryStatus(s.status as string)).length;
  }

  return NextResponse.json({
    enquiries: enquiries.map((e) => ({ ...e, last_followed_up_at: lastFollowUp[e.id] ?? null })),
    stats: { total: createdIds.length, booked },
  });
}

export async function POST(request: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  let body: { name?: string; phone?: string; referral_source?: string; enquired_on?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const phone = body.phone?.trim() || null; // Messenger enquiries have no number
  const referral_source = body.referral_source?.trim() || null;
  if (!name) return NextResponse.json({ error: "Name is required.", field: "name" }, { status: 400 });

  // Back-dating lets staff enter enquiries that arrived days ago. Never the future.
  let created_at: string | undefined;
  if (body.enquired_on) {
    const d = new Date(`${body.enquired_on}T12:00:00+08:00`);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "That date is not valid.", field: "enquired_on" }, { status: 400 });
    }
    if (d.getTime() > Date.now()) {
      return NextResponse.json({ error: "The enquiry date can't be in the future.", field: "enquired_on" }, { status: 400 });
    }
    created_at = d.toISOString();
  }

  const supabase = await createClient();

  // Same person already on file (by phone)? Don't make a second record.
  const phoneKey = phoneKeyFor(phone);
  if (phoneKey) {
    const { data: known } = await supabase
      .from("signups")
      .select("id, name, status, customer_no")
      .eq("phone_normalised", phoneKey)
      .limit(1)
      .maybeSingle();
    if (known) {
      return NextResponse.json(
        {
          error: `This number is already on file as ${customerRef(known.customer_no as number | null)} (${known.name}).`,
          field: "phone",
          signup_id: known.id,
        },
        { status: 409 },
      );
    }
  }

  const score = scoreLead({ referralSource: referral_source, hasPhone: !!phone, hoursToPurchase: null });

  const { data: signup, error } = await supabase
    .from("signups")
    .insert({
      name,
      email: null,
      phone,
      phone_normalised: phoneKey,
      referral_source,
      status: ENQUIRY_STATUS,
      ...(created_at ? { created_at } : {}),
      lead_score: score.lead_score,
      lead_score_source: score.lead_score_source,
      lead_score_confidence: score.lead_score_confidence,
      lead_score_review_status: "unreviewed",
    })
    .select()
    .single();

  if (error || !signup) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  await logActivity(supabase, {
    entity_type: "signup",
    entity_id: signup.id,
    action: "enquiry_created",
    actor: "sales_dashboard",
    metadata: { referral_source },
  });
  await logAudit(supabase, {
    table_name: "signups",
    row_id: signup.id,
    operation: "INSERT",
    new_data: signup,
    actor: "sales_dashboard",
  });

  return NextResponse.json({ signup }, { status: 201 });
}
