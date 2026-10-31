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

/**
 * The customer number as staff say and write it: KH001.
 *
 * Padded to three digits so the common case lines up in a column; past 999 it
 * simply grows to KH1000 rather than breaking. The stored value is a plain
 * integer — the "KH" and the padding are presentation, so the prefix can
 * change without rewriting anyone's identity.
 *
 * Null only for a row written before migration 0015, which is nothing in
 * practice; rendered as "—" rather than "KH000".
 */
export function customerRef(customerNo: number | null | undefined): string {
  if (customerNo === null || customerNo === undefined) return "—";
  return `KH${String(customerNo).padStart(3, "0")}`;
}


export type CustomerRow = {
  id: string;
  name: string | null;
  phone: string | null;
  customer_no: number | null;
};

/**
 * The person behind a phone number: the customer already on file, or a new one.
 *
 * Shared by the intake form and the walk-in voucher sale, so both put people
 * in the customer list the same way. Matched on `phone_normalised`, the
 * identity the first-visit rule, the voucher cap and the customer number all
 * use — a returning guest is filed against who they already are and keeps their
 * number rather than collecting a second one. The OLDEST row wins, since that
 * is the one the number was first issued on.
 *
 * Returns null when there is no usable phone (nothing to match on, and a
 * guess would merge two strangers) or when the insert failed. Callers decide
 * whether that is fatal; for both current callers it is not.
 */
export async function findOrCreateCustomer(
  supabase: ReturnType<typeof createAdminClient>,
  { name, phone, source }: { name: string; phone: string; source: string },
): Promise<{ customer: CustomerRow; created: boolean } | null> {
  const phoneKey = phoneKeyFor(phone);
  if (!phoneKey || !name.trim()) return null;

  const { data: known } = await supabase
    .from("signups")
    .select("id, name, phone, customer_no")
    .eq("phone_normalised", phoneKey)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (known) return { customer: known as CustomerRow, created: false };

  const { data: made, error } = await supabase
    .from("signups")
    .insert({
      name: name.trim(),
      email: null,
      phone: phone.trim(),
      phone_normalised: phoneKey,
      referral_source: source,
      status: "signed_up",
    })
    .select("id, name, phone, customer_no")
    .single();

  if (error || !made) {
    console.error("could not add the customer:", error?.message);
    return null;
  }
  return { customer: made as CustomerRow, created: true };
}
