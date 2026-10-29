import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import PurchaseForm from "./purchase-form";
import Logo from "@/app/logo";
import { PRELAUNCH_MODE, LAUNCH_WINDOW } from "@/lib/config";
import { formatSlotTime } from "@/lib/slots";
import { productIdForSlug, FIRST_VISIT_PRODUCT_ID } from "@/config/catalogue";
import { hasBookedBefore } from "@/lib/customer";
import { promotionForBookingDate, isPromotionProduct, isVoucherProduct, activeVoucherOffer } from "@/config/promotions";
import { voucherAllowance, unusedVoucherFor } from "@/lib/vouchers";

export default async function PurchasePage({
  params,
  searchParams,
}: {
  params: Promise<{ signupId: string }>;
  searchParams: Promise<{ date?: string; time?: string; option?: string; later?: string }>;
}) {
  const { signupId } = await params;
  const { date: slotDate, time: slotTime, option, later } = await searchParams;
  const supabase = createAdminClient();

  const { data: signup } = await supabase.from("signups").select("*").eq("id", signupId).maybeSingle();

  if (!signup) {
    notFound();
  }

  /* `later=1` is the customer saying "take my money now, I'll sort the date
     out with you" — the one deliberate way to reach this page without a slot.
     It exists for the voucher, which IS a prepaid credit with a redeem-by
     date rather than an appointment: making somebody choose a December
     afternoon before they are allowed to pay RM11 loses the sale over a
     decision they do not have to make yet. */
  const bookLater = later === "1";

  // Otherwise payment confirms a slot the customer has already chosen.
  // Arriving here without one means they skipped a step (or shared the link) —
  // send them to pick a time rather than taking money for a visit with no date.
  if (!PRELAUNCH_MODE && !bookLater && !(slotDate && slotTime)) {
    redirect(`/purchase/${signupId}/book`);
  }

  // Matched on phone, not on this signup row alone — see lib/customer.ts.
  const isReturning = await hasBookedBefore(supabase, signup);

  // Active catalogue for the order picker. If the products table doesn't exist yet
  // (migration 0006 not applied), fall back to an empty list — the form then shows
  // the legacy single first-visit item.
  const { data: allProducts } = await supabase
    .from("products")
    .select("id, name, description, price_myr, category")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  // The first visit is a one-per-person offer, so it simply isn't on the menu
  // for someone who already has a booking. The API enforces this too — hiding
  // a radio button is presentation, not a rule.
  // On a promotion day the offer is the entire menu — the first visit is paused
  // and no package is bookable, for everyone. On every other day the promotion
  // product isn't on the menu at all, so it can't be bought for the wrong date.
  // The API applies the same rule; this is the half the customer sees.
  const promo = promotionForBookingDate(slotDate);

  /* The 11.11 voucher IS bookable here, but only while it is on sale and only
     while this phone has allowance left. The cap is counted on the number, the
     same one the band uses, so the two routes share a limit rather than having
     one each — buying two in the band and two here would otherwise be four.

     Checked here so the option is simply absent once they have had their two;
     /api/purchases checks it again, because hiding a radio button is
     presentation, not a rule. */
  const voucherOnSale = activeVoucherOffer();
  const voucherAllow = voucherOnSale
    ? await voucherAllowance(supabase, signup.phone as string | null)
    : null;

  /* Already bought one in the band and come back for a date? Then the option
     has to be here EVEN IF the cap is used up — their two are spent on
     vouchers they own, and this is them collecting one. Offered after the
     sale closes too: the sale ends on 11 November, the right to use what you
     bought runs to 31 December. */
  const heldVoucher = await unusedVoucherFor(supabase, signup.phone as string | null);

  const voucherBookable =
    !!heldVoucher || (!!voucherOnSale && !!voucherAllow?.countable && voucherAllow.remaining > 0);

  const products = (allProducts ?? []).filter((p) => {
    if (promo) return p.id === promo.productId;
    if (isPromotionProduct(p.id)) return false;
    /* Paying with no date is only coherent for the voucher, which carries a
       redeem-by date of its own. A dateless visit has no terms saying when it
       must be used, so it would just become a message for someone to chase —
       and `later=1` is a URL anyone can type, so the rule lives here and not
       only in the link that offers it. */
    if (bookLater) return isVoucherProduct(p.id) && voucherBookable;
    if (isVoucherProduct(p.id)) return voucherBookable;
    return !(isReturning && p.id === FIRST_VISIT_PRODUCT_ID);
  });

  /* Nothing left to sell on the dateless path — their two vouchers are spent,
     or the sale has closed. Without this the picker would fall through to its
     empty-catalogue fallback and quietly offer the legacy RM25 first visit
     with no date on it. Send them to the calendar, which says what IS open. */
  if (bookLater && products.length === 0) {
    redirect(`/purchase/${signupId}/book`);
  }

  // The tier they clicked on /prices, resolved to a real catalogue row. An
  // unrecognised or withdrawn option falls through to null and the form simply
  // defaults, rather than 404ing someone who followed a stale link.
  // Checked against the filtered list, so a returning guest arriving on a
  // "First Soak" link falls back to the default rather than preselecting an
  // option that is no longer theirs to take.
  const preselectedId = productIdForSlug(option);
  const preselected =
    preselectedId && products.some((p) => p.id === preselectedId) ? preselectedId : null;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-sm border border-black/5 p-8 space-y-6">
        <div className="text-center space-y-1">
          <Logo size="sm" className="mb-2" />
          <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            {PRELAUNCH_MODE
              ? "Reserve your launch spot"
              : isReturning
                ? "Book your next visit"
                : "Complete your purchase"}
          </h1>
          <p className="text-black/60 text-sm">
            {PRELAUNCH_MODE
              ? `Hi ${signup.name.split(" ")[0]}, lock in the launch price — we open in ${LAUNCH_WINDOW} and we'll message you to schedule your visit.`
              : bookLater
                ? `Hi ${signup.name.split(" ")[0]}, pay now and we'll message you to arrange a time that suits you.`
                : isReturning
                  ? `Welcome back, ${signup.name.split(" ")[0]}. Your slot is held until you complete this step.`
                  : `Hi ${signup.name.split(" ")[0]}, your slot is held until you complete this step.`}
          </p>
        </div>

        {slotDate && slotTime && (
          <div className="rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-wider text-black/50">Your chosen time</p>
            <p className="font-medium" style={{ color: "var(--lagoon-dark)" }}>
              {new Date(`${slotDate}T00:00:00`).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}{" "}
              at {formatSlotTime(slotTime)}
            </p>
            <p className="mt-1 text-xs text-black/50">Confirmed once your payment is received.</p>
            {promo && (
              <p className="mt-2 rounded-lg bg-[#FBEFD6] px-3 py-2 text-xs leading-relaxed text-[#7a5410]">
                <span className="font-semibold">{promo.title} — {promo.price}.</span> It&apos;s the one
                thing we&apos;re serving on {promo.badge.toLowerCase().replace(" only", "")}, so our
                usual prices and first-visit offer are paused for the day.
              </p>
            )}
          </div>
        )}
        <PurchaseForm
          signupId={signup.id}
          signupName={signup.name}
          signupPhone={signup.phone ?? ""}
          products={products}
          voucherAlreadyPaid={!!heldVoucher}
          voucherMaxQuantity={voucherOnSale && !heldVoucher ? (voucherAllow?.remaining ?? 0) : 1}
          bookLater={bookLater}
          slotDate={bookLater ? null : (slotDate ?? null)}
          slotTime={bookLater ? null : (slotTime ?? null)}
          preselectedProductId={preselected}
          option={option ?? null}
          isReturning={isReturning}
        />
      </div>
    </main>
  );
}
