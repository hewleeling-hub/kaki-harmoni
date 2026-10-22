import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client for the BOOKKEEPING database.
//
// The ledger lives in a separate Supabase project from the operational app
// (signups, purchases, products). Everything accounting — accounts, journals,
// journal_lines, expenses — is in that second project, so the management
// reports cannot use the normal clients in this folder.
//
// Set both in Vercel env vars (server-side only, never NEXT_PUBLIC_):
//   FINANCIALS_SUPABASE_URL
//   FINANCIALS_SUPABASE_SERVICE_ROLE_KEY
//
// Returns null when either is missing so the reports page can explain what is
// needed instead of crashing the whole dashboard.
export function createFinancialsClient() {
  const url = process.env.FINANCIALS_SUPABASE_URL;
  const key = process.env.FINANCIALS_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
