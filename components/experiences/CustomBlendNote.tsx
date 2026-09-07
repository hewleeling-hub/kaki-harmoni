import { DropletIcon } from "@/components/ui/icons";
import { whatsappLink } from "@/config/business";

/**
 * One callout doing the job two used to. There was a "create your own blend"
 * note here and, directly beneath it, a "Not sure which one feels right today?"
 * panel with a Help Me Choose button — two boxes back to back asking a version
 * of the same question, which made the page look like it was nagging.
 *
 * The WhatsApp link is deliberately NOT a button. A button says the website
 * will do something for you; what actually happens is a conversation with a
 * person, who then recommends a blend. Ask on arrival is the primary route
 * anyway — the shop is where the oils are — so messaging first is the smaller
 * of the two options and is sized accordingly.
 */
export function CustomBlendNote() {
  return (
    <section className="py-6">
      <div className="overflow-hidden rounded-[24px] border border-line bg-[linear-gradient(150deg,#FBEFD6_0%,#EFD9C0_100%)] p-6 shadow-[var(--shadow-warm)] sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ivory text-coral shadow-[var(--shadow-warm)]">
            <DropletIcon size={26} />
          </span>
          <div className="flex-1">
            <h3 className="text-[22px] text-olive-dark sm:text-[24px]">
              Not sure which one suits you?
            </h3>
            <p className="mt-1.5 max-w-2xl text-[16px] leading-relaxed text-brown">
              Tell us how you&apos;re feeling and we&apos;ll help you choose — or we&apos;ll make
              you something of your own. Beyond the four signature soaks we can mix and match{" "}
              <strong className="text-olive-dark">7 aromatic oils</strong> and{" "}
              <strong className="text-olive-dark">3 herbal spa salts</strong> into a blend just for
              you. Just ask when you arrive, or{" "}
              <a
                href={whatsappLink(
                  "Hi Kaki Harmoni! I'm not sure which soak suits me — could you help me choose?",
                )}
                className="font-semibold text-olive-dark underline decoration-olive/40 underline-offset-4 transition-colors hover:decoration-olive"
              >
                message us on WhatsApp
              </a>{" "}
              beforehand.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
