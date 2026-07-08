import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: signup } = await supabase.from("signups").select("*").eq("id", id).maybeSingle();

  if (!signup) {
    notFound();
  }

  const alreadyConverted = signup.status === "converted";

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-sm border border-black/5 p-8 text-center space-y-4">
        <div
          className="mx-auto h-12 w-12 rounded-full flex items-center justify-center text-white text-xl"
          style={{ background: "var(--lagoon)" }}
        >
          ✓
        </div>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          You&apos;re on the list, {signup.name.split(" ")[0]}!
        </h1>
        <p className="text-black/70">
          We&apos;ve saved your spot. {alreadyConverted
            ? "You've already completed your purchase — see you soon."
            : "Ready to lock it in with a purchase?"}
        </p>

        {alreadyConverted ? (
          <Link
            href="/"
            className="inline-block rounded-lg px-4 py-2.5 font-medium text-white"
            style={{ background: "var(--lagoon)" }}
          >
            Back to home
          </Link>
        ) : (
          <Link
            href={`/purchase/${signup.id}`}
            className="inline-block rounded-lg px-4 py-2.5 font-medium text-white"
            style={{ background: "var(--clay)" }}
          >
            Complete purchase
          </Link>
        )}
      </div>
    </main>
  );
}
