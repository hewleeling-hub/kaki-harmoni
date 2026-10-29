import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Logo from "@/app/logo";
import BookingForm from "./booking-form";
import { PRELAUNCH_MODE } from "@/lib/config";
import Link from "next/link";
import { activeVoucherOffer, isVoucherProduct } from "@/config/promotions";
import { productIdForSlug } from "@/config/catalogue";
import { unusedVoucherFor } from "@/lib/vouchers";

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
  const askedForVoucher = isVoucherProduct(productIdForSlug(option));
  /* NOT offered to somebody who already owns a voucher. They have already paid;
     picking a time is the only thing left to do, and "pay now and pick your
     time later" would take them to a checkout with nothing to charge and
     nothing to book — a link that looks like it does something and doesn't. */
  const ownsAVoucher = !!(await unusedVoucherFor(supabase, signup.phone as string | null));
  const canBookLater = !!voucherOffer && askedForVoucher && !ownsAVoucher;

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
              I&apos;d rather pay now and pick my time later
            </Link>
            <p className="mt-1 text-xs text-black/50">
              We&apos;ll message you to arrange a time that suits you.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
