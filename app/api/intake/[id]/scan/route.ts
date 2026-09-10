import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { INTAKE_SCAN_BUCKET } from "@/config/intake";

/** How long a link to a signed form stays good for. */
const SIGNED_URL_SECONDS = 60;

/**
 * Opens the scan of a signed intake form.
 *
 * Returns a short-lived signed URL rather than the file, and never a permanent
 * one. The bucket is private (migration 0019) precisely so that a link to a
 * photograph of somebody's signed health form and IC number cannot be shared,
 * bookmarked or leaked out of a browser history and still work an hour later.
 *
 * A minute is enough to redirect the browser to it and no longer.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: record } = await supabase
    .from("spa_survey_forms")
    .select("id, scan_path")
    .eq("id", id)
    .maybeSingle();

  if (!record?.scan_path) {
    return NextResponse.json({ error: "No scan on this record." }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from(INTAKE_SCAN_BUCKET)
    .createSignedUrl(record.scan_path as string, SIGNED_URL_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("intake scan link failed:", error?.message);
    return NextResponse.json({ error: "Could not open that scan." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
