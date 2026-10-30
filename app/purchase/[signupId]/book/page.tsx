import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Logo from "@/app/logo";
import BookingForm from "./booking-form";
import { PRELAUNCH_MODE } from "@/lib/config";
import Link from "next/link";
import { activeVoucherOffer } from "@/config/promotions";
import { unusedVoucherFor, voucherAllowance } from "@/lib/vouchers";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ signupId: string }>;
  searchParams: Promise<{ taken?: string; option?: string }>;
}) {
  const { signupId } = await params;
  // `taken` is set when payment was refused because the slot filled while
  // checking out; `option` is the tier chosen back on /prices.
  const { taken, option } = await searchParams;

  // Pre-launch: slots aren't open yet — reservations skip straight to confirmation.
  if (PRELAUNCH_MODE) {
    redirect(`/purchase/${signupId}/success`);
  }

  const supabase = createAdminClient();

  const { data: signup } = await supabase.from("signups").select("*").eq("id", signupId).maybeSingle();
  if (!signup) {
    notFound();
  }

  /* "I'll pick my time later" is offered for the voucher only.
     A voucher is a prepaid credit with a redeem-by date printed on it, so
     paying before choosing a date is how it is meant to work — and insisting
     on a December afternoon before taking RM11 loses sales to a decision the
     customer does not have to make yet.
     A visit is different: a dateless RM40 booking has no terms saying when it
     must be used, so it would just become a message for someone to chase. */
  const voucherOffer = activeVoucherOffer();
  /* NOT offered to somebody who already owns a voucher. They have already paid;
     picking a time is the only thing left to do, and "pay now and pick your
     time later" would take them to a checkout with nothing to charge and
     nothing to book — a link that looks like it does something and doesn't. */
  const ownsAVoucher = !!(await unusedVoucherFor(supabase, signup.phone as string | null));
  /* Nor to somebody who has used their two. /purchase/[id]?later=1 would find
     nothing to sell and send them straight back here — a link that loops. The
     cap fails closed, so an uncountable number gets no link either. */
  const allowance = voucherOffer
    ? await voucherAllowance(supabase, signup.phone as string | null, voucherOffer)
    : null;
  /* Offered to everyone while the promo is on, not only to someone who arrived
     with ?option=eleven-eleven: people reach this page from the ordinary
     reserve form too, and a customer who wants to pay for the 11.11 voucher
     first should not have to have found the right link to be allowed to. */
  const canBookLater =
    !!voucherOffer && !ownsAVoucher && !!allowance?.countable && allowance.remaining > 0;

  // An existing booking used to send people straight to the success page,
  // which made a second visit impossible to book — the routine ladder is built
  // on people coming back, so a returning guest belongs in the calendar, not at
  // a dead end. Their previous visit is history, not a blocker.

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-sm border border-black/5 p-8 space-y-6">
        <div className="text-center space-y-1">
          <Logo size="sm" className="mb-2" />
          <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            Pick your visit time
          </h1>
          <p className="text-black/60 text-sm">
            Choose a time that suits you, {signup.name.split(" ")[0]}. Your slot is confirmed once
            payment is received on the next step.
          </p>
        </div>

        {taken && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Sorry — that time filled up while you were checking out, so nothing was charged. Please
            pick another slot.
          </div>
        )}
        <BookingForm signupId={signupId} option={option ?? null} />

        {canBookLater && (
          <div className="border-t border-black/10 pt-4 text-center">
            <Link
              href={`/purchase/${signupId}?later=1${option ? `&option=${encodeURIComponent(option)}` : ""}`}
              className="text-sm font-medium underline underline-offset-2"
              style={{ color: "var(--lagoon-dark)" }}
            >
              Want the 11.11 voucher? Pay now and pick your time later
            </Link>
            <p className="mt-1 text-xs text-black/50">
              {voucherOffer?.price} a soak, redeem by {voucherOffer?.redeemByLabel}. We&apos;ll
              message you to arrange a time that suits you.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
