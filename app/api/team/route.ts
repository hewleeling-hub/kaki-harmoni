import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireManager } from "@/lib/auth";
import { logAudit } from "@/lib/activity";

// GET /api/team — list all teammates (owner/manager only).
export async function GET() {
  const manager = await requireManager();
  if (!manager) {
    return NextResponse.json({ error: "Managers only." }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load the team." }, { status: 500 });
  }
  return NextResponse.json({ team: data ?? [] });
}

// POST /api/team — invite a new teammate by email (owner/manager only).
export async function POST(request: NextRequest) {
  const manager = await requireManager();
  if (!manager) {
    return NextResponse.json({ error: "Managers only." }, { status: 403 });
  }

  let body: { email?: string; full_name?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const fullName = (body.full_name ?? "").trim();
  const role = body.role === "manager" ? "manager" : "staff"; // owners can't be invited

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role },
  });

  if (error) {
    const msg = /already/i.test(error.message)
      ? "That email is already on the team."
      : "Could not send the invite. Check that email is set up in Supabase Auth.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (data.user?.id) {
    const supabase = await createClient();
    await logAudit(supabase, {
      table_name: "profiles",
      row_id: data.user.id,
      operation: "INSERT",
      new_data: { email, role, invited: true },
      actor: manager.email ?? "manager",
    });
  }

  return NextResponse.json({ ok: true, invited: { email, role } });
}
