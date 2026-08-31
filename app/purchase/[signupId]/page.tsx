import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PurchaseForm from "./purchase-form";
import Logo from "@/app/logo";
import { PRELAUNCH_MODE, LAUNCH_WINDOW } from "@/lib/config";
import { formatSlotTime } from "@/lib/slots";
import { productIdForSlug } from "@/config/catalogue";

export default async function PurchasePage({
  params,
  searchParams,
}: {
  params: Promise<{ signupId: string }>;
  searchParams: Promise<{ date?: string; time?: string; option?: string }>;
}) {
  const { signupId } = await params;
  const { date: slotDate, time: slotTime, option } = await searchParams;
  const supabase = createAdminClient();

  const { data: signup } = await supabase.from("signups").select("*").eq("id", signupId).maybeSingle();

  if (!signup) {
    notFound();
  }

  // Payment now confirms a slot the customer has already chosen. Arriving here
  // without one means they skipped a step (or shared the link) — send them to
  // pick a time rather than taking money for a visit with no date on it.
  if (!PRELAUNCH_MODE && !(slotDate && slotTime)) {
    redirect(`/purchase/${signupId}/book`);
  }

  // Active catalogue for the order picker. If the products table doesn't exist yet
  // (migration 0006 not applied), fall back to an empty list — the form then shows
  // the legacy single first-visit item.
  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price_myr, category")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  // The tier they clicked on /prices, resolved to a real catalogue row. An
  // unrecognised or withdrawn option falls through to null and the form simply
  // defaults, rather than 404ing someone who followed a stale link.
  const preselectedId = productIdForSlug(option);
  const preselected =
    preselectedId && (products ?? []).some((p) => p.id === preselectedId) ? preselectedId : null;

  if (signup.status === "converted") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-sm border border-black/5 p-8 text-center space-y-4">
          <Logo size="sm" />
          <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            You&apos;ve already completed your purchase. Thank you!
          </h1>
          <Link href="/" className="inline-block rounded-lg px-4 py-2.5 font-medium text-white" style={{ background: "var(--lagoon)" }}>
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-sm border border-black/5 p-8 space-y-6">
        <div className="text-center space-y-1">
          <Logo size="sm" className="mb-2" />
          <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            {PRELAUNCH_MODE ? "Reserve your launch spot" : "Complete your purchase"}
          </h1>
          <p className="text-black/60 text-sm">
            {PRELAUNCH_MODE
              ? `Hi ${signup.name.split(" ")[0]}, lock in the launch price — we open in ${LAUNCH_WINDOW} and we'll message you to schedule your visit.`
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
          </div>
        )}
        <PurchaseForm
          signupId={signup.id}
          signupName={signup.name}
          signupPhone={signup.phone ?? ""}
          products={products ?? []}
          slotDate={slotDate ?? null}
          slotTime={slotTime ?? null}
          preselectedProductId={preselected}
          option={option ?? null}
        />
      </div>
    </main>
  );
}
