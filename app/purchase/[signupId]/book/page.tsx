import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Logo from "@/app/logo";
import BookingForm from "./booking-form";
import { PRELAUNCH_MODE } from "@/lib/config";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ signupId: string }>;
  searchParams: Promise<{ taken?: string }>;
}) {
  const { signupId } = await params;
  // Set when payment was refused because the slot filled while checking out.
  const { taken } = await searchParams;

  // Pre-launch: slots aren't open yet — reservations skip straight to confirmation.
  if (PRELAUNCH_MODE) {
    redirect(`/purchase/${signupId}/success`);
  }

  const supabase = createAdminClient();

  const { data: signup } = await supabase.from("signups").select("*").eq("id", signupId).maybeSingle();
  if (!signup) {
    notFound();
  }

  // Choosing a slot now comes BEFORE payment, so there is deliberately no
  // purchase to look for here. If one already exists the visit is booked and
  // paid for, and there is nothing left to do.
  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("signup_id", signupId)
    .maybeSingle();

  if (purchase) {
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
        <BookingForm signupId={signupId} />
      </div>
    </main>
  );
}
