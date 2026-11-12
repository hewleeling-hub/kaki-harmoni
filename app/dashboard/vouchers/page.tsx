import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadVoucherCustomers } from "@/lib/voucher-customers";
import VouchersClient from "./vouchers-client";

// Every role: whoever receives the WhatsApp payment screenshot is the one
// who marks the voucher paid, and that is usually the person on the floor.
export default async function VouchersPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  // For picking an existing customer on the walk-in form. Read on the server with
  // the service-role client: the tables are not readable from the browser.
  const customers = await loadVoucherCustomers(createAdminClient());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          Vouchers
        </h1>
        <p className="text-black/60 mt-1">
          RM11 vouchers claimed on the site. Mark one paid when the payment screenshot arrives.
        </p>
      </div>
      <VouchersClient customers={customers} />
    </div>
  );
}
