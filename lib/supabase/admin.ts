import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client for PUBLIC flows (signup, purchase, slot booking).
// Uses the service-role key, which bypasses RLS — required once the v1
// permissive policies are replaced by staff-only policies (migration 0004).
//
// SUPABASE_SERVICE_ROLE_KEY must be set in Vercel env vars (server-side only,
// never NEXT_PUBLIC_). Falls back to the anon key if missing so the app keeps
// working before the env var + migration are applied.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
