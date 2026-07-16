import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import PurchaseForm from "./purchase-form";
import Logo from "@/app/logo";
import { PRELAUNCH_MODE } from "@/lib/config";

export default async function PurchasePage({ params }: { params: Promise<{ signupId: string }> }) {
  const { signupId } = await params;
  const supabase = createAdminClient();

  const { data: signup } = await supabase.from("signups").select("*").eq("id", signupId).maybeSingle();

  if (!signup) {
    notFound();
  }

  // Active catalogue for the order picker. If the products table doesn't exist yet
  // (migration 0006 not applied), fall back to an empty list — the form then shows
  // the legacy single first-visit item.
  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price_myr, category")
    .eq("active", true)
    .order("sort_order", { ascending: true });

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
              ? `Hi ${signup.name.split(" ")[0]}, lock in the launch price — we'll schedule your visit when we open.`
              : `Hi ${signup.name.split(" ")[0]}, lock in your spot.`}
          </p>
        </div>
        <PurchaseForm
          signupId={signup.id}
          signupName={signup.name}
          signupPhone={signup.phone ?? ""}
          products={products ?? []}
        />
      </div>
    </main>
  );
}
