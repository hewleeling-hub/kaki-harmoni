import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { extractIntakeForm, extractionAvailable } from "@/lib/intake-extract";
import { INTAKE_SCAN_MAX_BYTES } from "@/config/intake";

/**
 * Read a photographed form and hand the fields back as a suggestion.
 *
 * Saves nothing. The response goes into the boxes on screen for a member of
 * staff to check, and only their Save writes anything down. That separation is
 * the whole safety story: an AI misreading "Diabetes" is a UI correction, not a
 * false health record on a guest.
 *
 * Staff-only, like everything under /api/intake.
 */

/** PDFs are accepted as scans but not read here — this path is images only. */
const READABLE = ["image/jpeg", "image/png", "image/webp"] as const;

export async function POST(request: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  if (!extractionAvailable()) {
    return NextResponse.json(
      { error: "Reading forms automatically isn't switched on. Key it in by hand." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const file = form.get("scan");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No photo to read." }, { status: 400 });
  }

  if (!(READABLE as readonly string[]).includes(file.type)) {
    return NextResponse.json(
      { error: "Only a photo can be read automatically — a PDF has to be keyed in." },
      { status: 400 },
    );
  }

  if (file.size > INTAKE_SCAN_MAX_BYTES) {
    return NextResponse.json({ error: "That photo is too large to read." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fields = await extractIntakeForm(buffer, file.type as (typeof READABLE)[number]);
    return NextResponse.json({ fields });
  } catch (error) {
    // Deliberately not echoed to the browser: an upstream error can carry
    // request detail, and this route's inputs are somebody's health form.
    console.error("intake extraction failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Could not read that photo. Key the form in by hand." },
      { status: 502 },
    );
  }
}
