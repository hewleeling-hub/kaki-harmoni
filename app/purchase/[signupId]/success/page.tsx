import Link from "next/link";
import Logo from "@/app/logo";
import { createClient } from "@/lib/supabase/server";
import { formatSlotTime } from "@/lib/slots";

export default async function PurchaseSuccessPage({ params }: { params: Promise<{ signupId: string }> }) {
  const { signupId } = await params;
  const supabase = await createClient();

  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("signup_id", signupId)
    .maybeSingle();

  const hasBooking = !!purchase?.booking_date && !!purchase?.booking_time;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-sm border border-black/5 p-8 text-center space-y-4">
        <Logo size="sm" />
        <div
          className="mx-auto h-12 w-12 rounded-full flex items-center justify-center text-white text-xl"
          style={{ background: "var(--clay)" }}
        >
          ✓
        </div>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          {hasBooking ? "You're all booked!" : "Purchase confirmed!"}
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
        ) : (
          <p className="text-black/70">Thanks — we&apos;ll see you at Kaki Harmoni soon.</p>
        )}

        <Link href="/" className="inline-block rounded-lg px-4 py-2.5 font-medium text-white" style={{ background: "var(--lagoon)" }}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
