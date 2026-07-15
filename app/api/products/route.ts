import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireManager } from "@/lib/auth";
import { logAudit } from "@/lib/activity";

const CATEGORIES = ["service", "addon", "package"];

// GET /api/products — full catalogue incl. inactive (owner/manager only).
export async function GET() {
  const manager = await requireManager();
  if (!manager) {
    return NextResponse.json({ error: "Managers only." }, { status: 403 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price_myr, category, active, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Could not load the catalogue." }, { status: 500 });
  }
  return NextResponse.json({ products: data ?? [] });
}

// POST /api/products — add a product (owner/manager only).
export async function POST(request: NextRequest) {
  const manager = await requireManager();
  if (!manager) {
    return NextResponse.json({ error: "Managers only." }, { status: 403 });
  }

  let body: {
    name?: string;
    description?: string;
    price_myr?: number;
    category?: string;
    sort_order?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const price = Number(body.price_myr);
  const category = CATEGORIES.includes(body.category ?? "") ? body.category : "service";

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Enter a valid price." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .insert({
      name,
      description: (body.description ?? "").trim() || null,
      price_myr: price,
      category,
      sort_order: Number.isFinite(body.sort_order) ? body.sort_order : 0,
      active: true,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not add the product." }, { status: 500 });
  }

  const supabase = await createClient();
  await logAudit(supabase, {
    table_name: "products",
    row_id: data.id,
    operation: "INSERT",
    new_data: data,
    actor: manager.email ?? "manager",
  });

  return NextResponse.json({ product: data }, { status: 201 });
}
