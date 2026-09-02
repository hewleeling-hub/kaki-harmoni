import type { createAdminClient } from "@/lib/supabase/admin";
import { normalisePhoneForWhatsApp } from "@/lib/whatsapp";

/**
 * "Have we met this person before?"
 *
 * The discounted first visit is a one-per-person acquisition offer, so this is
 * the question that decides whether it is on the menu. Both the checkout page
 * and POST /api/purchases call this, so what the customer is shown and what
 * the server allows cannot drift apart.
 *
 * Matched on PHONE, not the signup row. Email became optional in 0008 while
 * phone stayed required, so someone returning without an email (or with a
 * different one) creates a fresh signup row and would otherwise read as brand
 * new — and could claim RM25 again on every visit. See 0011_phone_identity.sql.
 *
 * A prior booking counts whether or not it was ever paid: a reservation made
 * and abandoned has still used the offer, or the same person could take RM25
 * repeatedly simply by never completing payment.
 */
export async function hasBookedBefore(
  supabase: ReturnType<typeof createAdminClient>,
  signup: { id: string; phone?: string | null },
): Promise<boolean> {
  const signupIds = await relatedSignupIds(supabase, signup);

  const { count } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .in("signup_id", signupIds);

  return (count ?? 0) > 0;
}

/**
 * Every signup row belonging to this phone number, including the one given.
 * Falls back to just that row when there is no usable phone, so a missing or
 * unparseable number degrades to the old per-signup behaviour rather than
 * matching everyone with a null phone against each other.
 */
async function relatedSignupIds(
  supabase: ReturnType<typeof createAdminClient>,
  signup: { id: string; phone?: string | null },
): Promise<string[]> {
  const phoneKey = signup.phone?.trim() ? normalisePhoneForWhatsApp(signup.phone) : null;
  if (!phoneKey) return [signup.id];

  const { data } = await supabase
    .from("signups")
    .select("id")
    .eq("phone_normalised", phoneKey);

  const ids = (data ?? []).map((row) => row.id as string);
  return ids.includes(signup.id) ? ids : [...ids, signup.id];
}

/** The value written to `signups.phone_normalised` on insert. */
export function phoneKeyFor(phone: string | null | undefined): string | null {
  return phone?.trim() ? normalisePhoneForWhatsApp(phone) : null;
}
