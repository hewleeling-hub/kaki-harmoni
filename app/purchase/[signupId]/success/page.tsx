import Link from "next/link";
import Logo from "@/app/logo";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatSlotTime } from "@/lib/slots";
import { PRELAUNCH_MODE, PAYMENT_QR } from "@/lib/config";

const money = (n: number) => `RM${Number(n).toFixed(2)}`;

export default async function PurchaseSuccessPage({ params }: { params: Promise<{ signupId: string }> }) {
  const { signupId } = await params;
  const supabase = createAdminClient();

  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("signup_id", signupId)
    .maybeSingle();

  const hasBooking = !!purchase?.booking_date && !!purchase?.booking_time;
  const isPending = purchase?.status === "pending_payment";
  const isPrepay = purchase?.payment_method === "ewallet";
  const amount = Number(purchase?.amount_myr ?? 0);

  const heading = hasBooking
    ? "You're all booked!"
    : PRELAUNCH_MODE
    ? "You're on the launch list!"
    : "Reservation confirmed!";

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-sm border border-black/5 p-8 text-center space-y-4">
        <Logo size="sm" />
        <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center text-white text-xl" style={{ background: "var(--clay)" }}>
          ✓
        </div>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          {heading}
        </h1>

        {hasBooking ? (
          <div className="rounded-lg bg-black/5 px-4 py-3 text-left">
            <p className="text-xs uppercase tracking-wide text-black/40 mb-1">Your visit</p>
            <p className="font-display text-lg font-semibold" style={{ color: "var(--lagoon-dark)" }}>
              {new Date(purchase.booking_date + "T00:00:00").toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-black/70">{formatSlotTime(purchase.booking_time)}</p>
          </div>
        ) : PRELAUNCH_MODE ? (
          <p className="text-black/70">
            We&apos;ll message you to pick your time the moment we open. Your launch price
            is locked in.
          </p>
        ) : (
          <p className="text-black/70">Thanks — we&apos;ll see you at Kaki Harmoni soon.</p>
        )}

        {isPending && isPrepay && (
          <div className="rounded-lg px-4 py-4 space-y-3" style={{ background: "rgba(46,125,123,0.08)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--lagoon-dark)" }}>
              Scan to pay {money(amount)} · DuitNow
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PAYMENT_QR}
              alt={`DuitNow QR to pay ${money(amount)} to Kaki Harmoni`}
              className="mx-auto w-56 rounded-lg bg-white"
            />
            <p className="text-xs text-black/55">
              Open any bank or e-wallet app, scan, and pay {money(amount)}. Your spot is
              locked once we receive it — fully refundable until your slot is confirmed.
            </p>
          </div>
        )}

        {isPending && !isPrepay && (
          <p className="text-sm text-black/60">
            You&apos;ve chosen to pay {money(amount)} at the door — see you when we open!
          </p>
        )}

        <Link href="/" className="inline-block rounded-lg px-4 py-2.5 font-medium text-white" style={{ background: "var(--clay)" }}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
