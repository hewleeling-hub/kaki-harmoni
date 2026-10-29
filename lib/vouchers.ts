import type { createAdminClient } from "@/lib/supabase/admin";
import { phoneKeyFor } from "@/lib/customer";
import { ELEVEN_ELEVEN, type VoucherOffer } from "@/config/promotions";

/**
 * The per-person voucher cap.
 *
 * "Maximum 2 vouchers per person" is printed on the poster, so it has to be a
 * rule the server keeps rather than a line of copy. Counted on
 * `phone_normalised` for the same reason the first-visit offer is
 * (lib/customer.ts): signups dedupe on email, which is optional since 0008, so
 * one person can own several signup rows. Counting rows would let someone
 * reach four vouchers by signing up twice.
 *
 * Cancelled vouchers are excluded — one that was claimed and never paid for
 * should not use up somebody's allowance.
 */
export interface VoucherAllowance {
  offer: VoucherOffer;
  /** Vouchers this phone already holds for this offer. */
  held: number;
  /** How many more it may buy. Never negative. */
  remaining: number;
  max: number;
  /**
   * Whether the count could actually be taken.
   *
   * False when there is no usable phone number, or when the query itself
   * failed. Callers must refuse on false rather than treating it as zero
   * held — see the note on failing closed below.
   */
  countable: boolean;
}

export async function voucherAllowance(
  supabase: ReturnType<typeof createAdminClient>,
  phone: string | null | undefined,
  offer: VoucherOffer = ELEVEN_ELEVEN,
): Promise<VoucherAllowance> {
  const phoneKey = phoneKeyFor(phone);

  // No usable number means no way to count, and an uncountable cap is no cap.
  // Refusing is the safe direction: the alternative is handing out unlimited
  // vouchers to anyone who omits a phone number.
  if (!phoneKey) {
    return { offer, held: 0, remaining: 0, max: offer.maxPerPerson, countable: false };
  }

  const { count, error } = await supabase
    .from("vouchers")
    .select("id", { count: "exact", head: true })
    .eq("phone_normalised", phoneKey)
    .eq("offer_id", offer.id)
    .neq("status", "cancelled");

  /* FAIL CLOSED. `count` is null when the query fails — a missing service-role
     key, RLS, a dropped connection. Treating that as "holds none" would have
     turned every failure into unlimited vouchers for whoever hit it, which is
     the one outcome a cap exists to prevent. Refusing is recoverable: the
     customer messages us and a human sorts it out. */
  if (error || count === null || count === undefined) {
    return { offer, held: 0, remaining: 0, max: offer.maxPerPerson, countable: false };
  }

  return {
    offer,
    held: count,
    remaining: Math.max(0, offer.maxPerPerson - count),
    max: offer.maxPerPerson,
    countable: true,
  };
}

/**
 * Why a voucher claim is being refused, or null when it may go ahead.
 *
 * Returns the reason rather than a boolean so the caller can say which rule
 * was hit — "you already have two" and "the sale has closed" are different
 * problems and a customer can act on only one of them.
 */
export type VoucherRefusal =
  | { reason: "sale_closed"; message: string }
  | { reason: "not_countable"; message: string }
  | { reason: "cap_reached"; message: string }
  | { reason: "too_many"; message: string };

export function refuseVoucherClaim({
  offer,
  allowance,
  wanted,
  onSale,
}: {
  offer: VoucherOffer;
  allowance: VoucherAllowance;
  wanted: number;
  onSale: boolean;
}): VoucherRefusal | null {
  if (!onSale) {
    return {
      reason: "sale_closed",
      message: `The ${offer.title} was on sale until ${offer.sellUntilLabel}. Do come and see us for our standing options.`,
    };
  }
  /* No usable number, or the count could not be taken. Either way the cap
     cannot be enforced for this request, so it does not go through. */
  if (!allowance.countable) {
    return {
      reason: "not_countable",
      message:
        "We couldn't check this number just now. Please message us on WhatsApp and we'll sort your voucher out.",
    };
  }
  if (allowance.remaining === 0) {
    return {
      reason: "cap_reached",
      message: `This number already has ${allowance.held} ${offer.title}${allowance.held === 1 ? "" : "s"} — ${offer.maxPerPerson} per person is the limit.`,
    };
  }
  if (wanted > allowance.remaining) {
    return {
      reason: "too_many",
      message: `You can take ${allowance.remaining} more on this number — ${offer.maxPerPerson} per person is the limit.`,
    };
  }
  return null;
}

/**
 * A voucher this phone has already paid for and not yet booked a slot against,
 * or null.
 *
 * The band sells vouchers without a date — "buy by 11 November, redeem by 31
 * December" means the slot is chosen later. When they come back to book,
 * checkout asks this: finding one means they already own a soak, so the
 * booking attaches to it instead of selling another. Without that the same
 * person either pays RM11 twice or writes a second voucher row and counts as
 * two against their own two-per-person limit.
 *
 * Oldest first, so a customer holding two uses the one bought first — which is
 * also the one that expires first if the terms ever differ between offers.
 *
 * Cancelled vouchers are excluded, and so are expired ones: a voucher past its
 * redeem-by date is not a soak somebody still owns.
 */
export async function unusedVoucherFor(
  supabase: ReturnType<typeof createAdminClient>,
  phone: string | null | undefined,
  offer: VoucherOffer = ELEVEN_ELEVEN,
  today: string = new Date().toISOString().slice(0, 10),
): Promise<{ id: string; price_myr: number } | null> {
  const phoneKey = phoneKeyFor(phone);
  if (!phoneKey) return null;

  const { data, error } = await supabase
    .from("vouchers")
    .select("id, price_myr")
    .eq("phone_normalised", phoneKey)
    .eq("offer_id", offer.id)
    .is("purchase_id", null)
    .neq("status", "cancelled")
    .gte("expires_on", today)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  /* A failed lookup must not invent a voucher. Returning null is the safe
     direction here — the opposite of the cap, where refusing is safe: this
     one decides whether to charge, so the failure mode is "they pay again
     and we sort it out", never "a free soak for anyone whose query errored". */
  if (error || !data) return null;
  return { id: data.id as string, price_myr: Number(data.price_myr) };
}
