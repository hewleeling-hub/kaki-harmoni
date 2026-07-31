import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { Lotti } from "@/components/ui/Lotti";
import { whatsAppLink, BUSINESS_WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { PREPAY_PRICE_MYR } from "@/lib/config";

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
    `Hi Kaki Harmoni! This is ${signup.name}. I reserved the RM${PREPAY_PRICE_MYR} first-visit offer but need a bit more time before purchasing — please remind me!`,
  );

  return (
    <main className="warm flex min-h-screen items-center justify-center bg-cream p-6">
      <div className="w-full max-w-md space-y-4 rounded-[24px] border border-line bg-ivory p-8 text-center shadow-[var(--shadow-warm)]">
        <Lotti size={96} className="mx-auto h-auto w-24" />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-olive text-xl text-ivory">
          ✓
        </div>
        <h1 className="text-[26px] text-olive-dark">You&apos;re on the list, {firstName}!</h1>
        <p className="text-[16px] text-muted">
          We&apos;ve saved your spot.{" "}
          {alreadyConverted
            ? "You've already completed your reservation — see you soon."
            : "Ready to lock it in with a prepayment?"}
        </p>

        {alreadyConverted ? (
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-[26px] bg-olive px-5 font-semibold text-ivory transition hover:bg-olive-dark"
          >
            Back to home
          </Link>
        ) : (
          <div className="space-y-3">
            <Link
              href={`/purchase/${signup.id}`}
              className="flex min-h-12 items-center justify-center rounded-[26px] bg-olive px-5 font-semibold text-ivory transition hover:bg-olive-dark"
            >
              Complete prepayment
            </Link>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 rounded-[26px] border border-olive bg-ivory px-5 font-semibold text-olive-dark transition hover:bg-beige/50"
            >
              <WhatsAppIcon />
              Remind me on WhatsApp
            </a>
            <p className="text-xs text-muted">
              No rush — we&apos;ll hold your spot at the RM{PREPAY_PRICE_MYR} first-visit price for 48 hours.
            </p>
            <Link href="/" className="inline-block text-sm text-muted underline underline-offset-2 hover:text-ink">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.13c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.11.11-1.79-.11a16.5 16.5 0 0 1-1.65-.62c-2.9-1.25-4.8-4.16-4.94-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.26-.29.58-.36.77-.36.19 0 .39 0 .55.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.37-.44.5-.15.14-.3.3-.13.59.17.29.76 1.26 1.64 2.04 1.13 1.01 2.08 1.32 2.37 1.47.29.15.46.13.63-.08.17-.2.72-.84.92-1.13.19-.29.39-.24.65-.14.27.1 1.68.79 1.97.94.29.14.48.21.55.33.07.12.07.7-.17 1.38Z" />
    </svg>
  );
}
