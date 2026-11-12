import type { createAdminClient } from "@/lib/supabase/admin";
import { ELEVEN_ELEVEN } from "@/config/promotions";

/**
 * Existing customers, each with how many 11.11 vouchers they already hold.
 *
 * For picking somebody on the walk-in sale form instead of retyping them: a
 * mistyped phone number creates a second customer, and a number that already
 * holds vouchers is refused at the cap — so the picker shows both the person and
 * what they hold, before anything is submitted.
 *
 * One entry per PERSON (customer number), as everywhere. Vouchers are counted on
 * the phone number, which is what the cap counts on, across every row that
 * person owns. Cancelled vouchers are left out, as the cap leaves them out.
 */
export type VoucherCustomer = {
  customer_no: number;
  name: string | null;
  phone: string | null;
  /** Vouchers held, which is what the two-per-person limit counts. */
  held: number;
  /** Of those, how many are still unpaid. */
  unpaid: number;
};

export async function loadVoucherCustomers(
  admin: ReturnType<typeof createAdminClient>,
  offerId: string = ELEVEN_ELEVEN.id,
): Promise<VoucherCustomer[]> {
  const [{ data: signups }, { data: vouchers }] = await Promise.all([
    admin
      .from("signups")
      .select("customer_no, name, phone, phone_normalised, created_at")
      .not("customer_no", "is", null)
      .not("phone", "is", null),
    admin
      .from("vouchers")
      .select("phone_normalised, status")
      .eq("offer_id", offerId)
      .neq("status", "cancelled"),
  ]);

  const held = new Map<string, { held: number; unpaid: number }>();
  for (const v of vouchers ?? []) {
    const key = v.phone_normalised as string;
    const entry = held.get(key) ?? { held: 0, unpaid: 0 };
    entry.held += 1;
    if (v.status === "reserved") entry.unpaid += 1;
    held.set(key, entry);
  }

  const people = new Map<number, { first: { created_at: string; name: string | null; phone: string | null }; keys: Set<string> }>();
  for (const s of signups ?? []) {
    const no = s.customer_no as number;
    const entry = people.get(no) ?? { first: { created_at: s.created_at as string, name: s.name as string | null, phone: s.phone as string | null }, keys: new Set<string>() };
    if (s.phone_normalised) entry.keys.add(s.phone_normalised as string);
    // The oldest row's name and number — the ones the customer number was issued on.
    if ((s.created_at as string) < entry.first.created_at) {
      entry.first = { created_at: s.created_at as string, name: s.name as string | null, phone: s.phone as string | null };
    }
    people.set(no, entry);
  }

  return [...people.entries()]
    .map(([customer_no, p]) => {
      let h = 0;
      let u = 0;
      for (const key of p.keys) {
        const e = held.get(key);
        if (e) {
          h += e.held;
          u += e.unpaid;
        }
      }
      return { customer_no, name: p.first.name, phone: p.first.phone, held: h, unpaid: u };
    })
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" }));
}
