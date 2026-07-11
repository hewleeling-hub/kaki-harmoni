import { createClient } from "@/lib/supabase/server";

// Staff-only guard: returns the logged-in user, or null.
// Public endpoints (signup create, purchase create, slot lookup, booking) don't use this;
// dashboard endpoints (listing all signups, editing, deleting, marking paid) do.
export async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
