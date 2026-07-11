import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Logo from "@/app/logo";
import { whatsAppLink, BUSINESS_WHATSAPP_NUMBER } from "@/lib/whatsapp";

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: signup } = await supabase.from("signups").select("*").eq("id", id).maybeSingle();

  if (!signup) {
    notFound();
  }

  const alreadyConverted = signup.status === "converted";
  const firstName = signup.name.split(" ")[0];
  const waLink = whatsAppLink(
    BUSINESS_WHATSAPP_NUMBER,
    `Hi Kaki Harmoni! This is ${signup.name}. I signed up for the RM25 first-visit offer but need a bit more time before purchasing — please remind me!`,
  );

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 rounded-2xl shadow-sm border border-black/5 p-8 text-center space-y-4">
        <Logo size="sm" />
        <div
          className="mx-auto h-12 w-12 rounded-full flex items-center justify-center text-white text-xl"
          style={{ background: "var(--lagoon)" }}
        >
          ✓
        </div>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
          You&apos;re on the list, {firstName}!
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
          <div className="space-y-3">
            <Link
              href={`/purchase/${signup.id}`}
              className="block rounded-lg px-4 py-2.5 font-medium text-white"
              style={{ background: "var(--clay)" }}
            >
              Complete purchase
            </Link>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium text-white"
              style={{ background: "#25D366" }}
            >
              <WhatsAppIcon />
              Remind me on WhatsApp
            </a>
            <p className="text-xs text-black/45">
              No rush — we&apos;ll hold your spot at the RM25 first-visit price for 48 hours.
            </p>
            <Link href="/" className="inline-block text-sm text-black/45 hover:text-black/65 underline underline-offset-2">
              No thanks, maybe another time
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.13c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.11.11-1.79-.11a16.5 16.5 0 0 1-1.65-.62c-2.9-1.25-4.8-4.16-4.94-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.26-.29.58-.36.77-.36.19 0 .39 0 .55.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.37-.44.5-.15.14-.3.3-.13.59.17.29.76 1.26 1.64 2.04 1.13 1.01 2.08 1.32 2.37 1.47.29.15.46.13.63-.08.17-.2.72-.84.92-1.13.19-.29.39-.24.65-.14.27.1 1.68.79 1.97.94.29.14.48.21.55.33.07.12.07.7-.17 1.38Z" />
    </svg>
  );
}
