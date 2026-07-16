import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Logo from "@/app/logo";
import BookingForm from "./booking-form";
import { PRELAUNCH_MODE } from "@/lib/config";

export default async function BookPage({ params }: { params: Promise<{ signupId: string }> }) {
  const { signupId } = await params;

  // Pre-launch: slots aren't open yet — reservations skip straight to confirmation.
  if (PRELAUNCH_MODE) {
    redirect(`/purchase/${signupId}/success`);
  }

  const supabase = createAdminClient();

  const { data: signup } = await supabase.from("signups").select("*").eq("id", signupId).maybeSingle();
  if (!signup) {
    notFound();
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("signup_id", signupId)
    .maybeSingle();

  if (!purchase) {
    // No purchase yet — send them back to complete that first.
    redirect(`/purchase/${signupId}`);
  }

  if (purchase.booking_date) {
    // Already booked — nothing left to do here.
    redirect(`/purchase/${signupId}/success`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-sm border border-black/5 p-8 space-y-6">
        <div className="text-center space-y-1">
          <Logo size="sm" className="mb-2" />
          <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            Pick your visit time
          </h1>
          <p className="text-black/60 text-sm">
            Purchase confirmed, {signup.name.split(" ")[0]} — now let&apos;s lock in a slot.
          </p>
        </div>
        <BookingForm purchaseId={purchase.id} signupId={signupId} />
      </div>
    </main>
  );
}
