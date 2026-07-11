"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton({ email }: { email: string }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="text-right">
      <p className="text-xs text-black/40 mb-1">{email}</p>
      <button
        onClick={signOut}
        className="text-xs font-medium px-3 py-1.5 rounded border border-black/10 hover:bg-black/5"
      >
        Sign out
      </button>
    </div>
  );
}
