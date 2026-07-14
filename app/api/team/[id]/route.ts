import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireManager } from "@/lib/auth";
import { logAudit } from "@/lib/activity";

type Role = "owner" | "manager" | "staff";

async function loadTarget(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", id)
    .maybeSingle();
  return data as { id: string; email: string | null; role: Role } | null;
}

async function ownerCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "owner");
  return count ?? 0;
}

// PATCH /api/team/[id] — change a teammate's role (owner/manager only).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const manager = await requireManager();
  if (!manager) {
    return NextResponse.json({ error: "Managers only." }, { status: 403 });
  }

  let body: { role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const role = body.role;
  if (role !== "owner" && role !== "manager" && role !== "staff") {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const target = await loadTarget(id);
  if (!target) {
    return NextResponse.json({ error: "Teammate not found." }, { status: 404 });
  }

  // Only an owner can promote someone to owner or change an existing owner.
  if ((role === "owner" || target.role === "owner") && manager.role !== "owner") {
    return NextResponse.json({ error: "Only an owner can manage owners." }, { status: 403 });
  }
  // Don't strip the last owner.
  if (target.role === "owner" && role !== "owner" && (await ownerCount()) <= 1) {
    return NextResponse.json({ error: "There must be at least one owner." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Could not update the role." }, { status: 500 });
  }

  const supabase = await createClient();
  await logAudit(supabase, {
    table_name: "profiles",
    row_id: id,
    operation: "UPDATE",
    old_data: { role: target.role },
    new_data: { role },
    actor: manager.email ?? "manager",
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/team/[id] — remove a teammate (owner/manager only).
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const manager = await requireManager();
  if (!manager) {
    return NextResponse.json({ error: "Managers only." }, { status: 403 });
  }

  if (id === manager.id) {
    return NextResponse.json({ error: "You can't remove yourself." }, { status: 400 });
  }

  const target = await loadTarget(id);
  if (!target) {
    return NextResponse.json({ error: "Teammate not found." }, { status: 404 });
  }
  if (target.role === "owner" && manager.role !== "owner") {
    return NextResponse.json({ error: "Only an owner can remove an owner." }, { status: 403 });
  }
  if (target.role === "owner" && (await ownerCount()) <= 1) {
    return NextResponse.json({ error: "There must be at least one owner." }, { status: 400 });
  }

  const admin = createAdminClient();
  // Deleting the auth user cascades to the profiles row (on delete cascade).
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ error: "Could not remove the teammate." }, { status: 500 });
  }

  const supabase = await createClient();
  await logAudit(supabase, {
    table_name: "profiles",
    row_id: id,
    operation: "DELETE",
    old_data: { email: target.email, role: target.role },
    actor: manager.email ?? "manager",
  });

  return NextResponse.json({ ok: true });
}
