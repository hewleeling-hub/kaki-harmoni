import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type Role = "owner" | "manager" | "staff";

export type StaffProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
};

// Staff-only guard: returns the logged-in user, or null.
// Public endpoints (signup create, purchase create, slot lookup, booking) don't use this;
// dashboard endpoints (listing all signups, editing, deleting, marking paid) do.
export async function requireStaff(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Returns the current user's profile (with role), or null if not signed in.
// Falls back to a 'staff' role if the profiles row doesn't exist yet (e.g. the
// 0005 migration hasn't been applied), so the app keeps working.
export async function getProfile(): Promise<StaffProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    return { id: user.id, email: user.email ?? null, full_name: null, role: "staff" };
  }
  return data as StaffProfile;
}

export async function getRole(): Promise<Role | null> {
  const profile = await getProfile();
  return profile?.role ?? null;
}

export function isManager(role: Role | null | undefined): boolean {
  return role === "owner" || role === "manager";
}

// Manager guard for privileged endpoints (team management, deletes).
// Returns the profile if the user is owner/manager, otherwise null.
export async function requireManager(): Promise<StaffProfile | null> {
  const profile = await getProfile();
  if (!profile || !isManager(profile.role)) return null;
  return profile;
}
