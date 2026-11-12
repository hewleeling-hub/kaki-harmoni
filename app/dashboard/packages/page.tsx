import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadVoucherCustomers } from "@/lib/voucher-customers";
import { packageSize } from "@/lib/packages";
import PackagesClient from "./packages-client";

// Every role: whoever takes the payment at the counter records the package.
export default async function PackagesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const admin = createAdminClient();
  const [customers, { data: products }] = await Promise.all([
    loadVoucherCustomers(admin),
    // Switched-off packages are still sellable at the counter; only the online shop hides them.
    admin.from("products").select("id, name, price_myr").order("price_myr", { ascending: true }),
  ]);
  const packages = (products ?? [])
    .filter((p) => packageSize(p.name))
    .map((p) => ({ id: p.id as string, name: p.name as string, price: Number(p.price_myr), visits: packageSize(p.name) as number }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          Packages
        </h1>
        <p className="text-black/60 mt-1">
          Sell a multi-visit package at the counter, then tick off each visit as they come. Valid 6 months from the day paid.
        </p>
      </div>
      <PackagesClient customers={customers} packages={packages} />
    </div>
  );
}
