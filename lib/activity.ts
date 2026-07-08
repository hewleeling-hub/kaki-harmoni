import type { SupabaseClient } from "@supabase/supabase-js";

// Named tool: log_activity (risk: Low, see docs/AGENTIC_LAYER.md)
export async function logActivity(
  supabase: SupabaseClient,
  params: {
    entity_type: "signup" | "purchase";
    entity_id: string;
    action: string;
    actor: string;
    metadata?: Record<string, unknown>;
  },
) {
  await supabase.from("activities").insert({
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    action: params.action,
    actor: params.actor,
    metadata: params.metadata ?? {},
  });
}

// Every meaningful state change also writes an append-only audit_logs row (docs/SECURITY.md)
export async function logAudit(
  supabase: SupabaseClient,
  params: {
    table_name: string;
    row_id: string;
    operation: "INSERT" | "UPDATE" | "DELETE";
    old_data?: Record<string, unknown> | null;
    new_data?: Record<string, unknown> | null;
    actor: string;
  },
) {
  await supabase.from("audit_logs").insert({
    table_name: params.table_name,
    row_id: params.row_id,
    operation: params.operation,
    old_data: params.old_data ?? null,
    new_data: params.new_data ?? null,
    actor: params.actor,
  });
}
