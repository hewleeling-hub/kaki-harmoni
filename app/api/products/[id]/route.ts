import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireManager } from "@/lib/auth";
import { logAudit } from "@/lib/activity";

const CATEGORIES = ["service", "addon", "package"];

// PATCH /api/products/[id] — edit a product or toggle active (owner/manager only).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const manager = await requireManager();
  if (!manager) {
    return NextResponse.json({ error: "Managers only." }, { status: 403 });
  }

  let body: {
    name?: string;
    description?: string;
    price_myr?: number;
    category?: string;
    active?: boolean;
    sort_order?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.description === "string") updates.description = body.description.trim() || null;
  if (body.price_myr !== undefined) {
    const price = Number(body.price_myr);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Enter a valid price." }, { status: 400 });
    }
    updates.price_myr = price;
  }
  if (typeof body.category === "string" && CATEGORIES.includes(body.category)) {
    updates.category = body.category;
  }
  if (typeof body.active === "boolean") updates.active = body.active;
  if (Number.isFinite(body.sort_order)) updates.sort_order = body.sort_order;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("products").update(updates).eq("id", id).select().single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not update the product." }, { status: 500 });
  }

  const supabase = await createClient();
  await logAudit(supabase, {
    table_name: "products",
    row_id: id,
    operation: "UPDATE",
    new_data: updates,
    actor: manager.email ?? "manager",
  });

  return NextResponse.json({ product: data });
}

// DELETE /api/products/[id] — remove a product, or archive it if it's already
// referenced by past orders (owner/manager only).
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const manager = await requireManager();
  if (!manager) {
    return NextResponse.json({ error: "Managers only." }, { status: 403 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);

  if (error) {
    // Likely referenced by order_items (FK) — archive instead of hard delete.
    const { error: archiveError } = await admin
      .from("products")
      .update({ active: false })
      .eq("id", id);
    if (archiveError) {
      return NextResponse.json({ error: "Could not remove the product." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, archived: true });
  }

  const supabase = await createClient();
  await logAudit(supabase, {
    table_name: "products",
    row_id: id,
    operation: "DELETE",
    actor: manager.email ?? "manager",
  });

  return NextResponse.json({ ok: true });
}
