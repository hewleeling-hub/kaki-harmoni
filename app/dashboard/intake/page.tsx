import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { INTAKE_COLUMNS } from "@/config/intake";
import { extractionAvailable } from "@/lib/intake-extract";
import { redirect } from "next/navigation";
import IntakeClient, { type IntakeForm, type IntakeSignup } from "./intake-client";

export const metadata = {
  title: "Intake — Kaki Harmoni",
  robots: { index: false, follow: false },
};

/**
 * Staff intake. Paper form signed by the guest, scanned in here, essentials
 * keyed alongside it.
 *
 * The dashboard layout already redirects anyone without a profile to /login,
 * so this is guarded twice over — belt and braces, since the page reads health
 * answers and IC numbers and a layout is an easy thing to refactor around.
 *
 * Data is fetched here on the server with the admin client rather than from
 * the browser: the table has RLS on with no policies, so a client-side query
 * would silently return nothing at all.
 */
export default async function IntakePage() {
  const user = await requireStaff();
  if (!user) redirect("/login");

  const supabase = createAdminClient();

  const [{ data: signups }, formsResult] = await Promise.all([
    supabase
      .from("signups")
      .select("id, name, phone, customer_no")
      .order("created_at", { ascending: false })
      .limit(300),
    supabase
      .from("spa_survey_forms")
      // Named columns rather than "*" on purpose. The table already exists in
      // production without the columns 0018 adds, so "*" would come back
      // happily and this page would look switched on right up until a save
      // failed. Naming them makes an unapplied migration an error here, which
      // is what the panel below reads.
      .select(INTAKE_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const migrationMissing = !!formsResult.error;
  if (formsResult.error) {
    console.error("intake list failed (is migration 0018 applied?):", formsResult.error.message);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Intake forms</h1>
          <p className="text-sm text-black/60">
            The signed paper form is the record. Scan it in here and note what was used.
          </p>
        </div>
        <Link
          href="/dashboard/intake/print"
          className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/5"
        >
          Print blank forms
        </Link>
      </div>

      {migrationMissing ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-semibold">Not switched on yet.</p>
          <p className="mt-1.5 leading-relaxed">
            The intake table needs migration <code>0018_spa_intake.sql</code>, and scans need the
            bucket from <code>0019_intake_scan_bucket.sql</code>. Neither has been applied — that
            was deliberate, so nothing touched the live database without you. Run both, then this
            page works.
          </p>
          <p className="mt-1.5 leading-relaxed">
            Printing blank forms works now regardless.
          </p>
        </div>
      ) : (
        <IntakeClient
          signups={(signups ?? []) as IntakeSignup[]}
          // The column list is a runtime string, so supabase-js can't infer a
          // row type from it the way it does for a literal select.
          forms={(formsResult.data ?? []) as unknown as IntakeForm[]}
          // Checked on the server: the key must never reach the browser, and
          // the button shouldn't appear if pressing it can only fail.
          canExtract={extractionAvailable()}
        />
      )}
    </div>
  );
}
