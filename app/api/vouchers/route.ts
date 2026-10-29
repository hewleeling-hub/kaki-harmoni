import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";

// GET /api/vouchers — every voucher with its owner and booked slot (staff only).
//
// Service-role client because `vouchers` has RLS on and no policies: the
// browser can never read it, so the staff check below is the only gate.
export async function GET() {
  const staff = await requireStaff();
  if (!staff) {
    return NextResponse.json({ error: "Staff only." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vouchers")
    .select(
      "id, created_at, phone_normalised, price_myr, status, expires_on, paid_at, redeemed_at, voucher_no, notes, purchase_id, signups(name, phone), purchases(booking_date, booking_time)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load vouchers." }, { status: 500 });
  }

  return NextResponse.json({ vouchers: data ?? [] });
}
