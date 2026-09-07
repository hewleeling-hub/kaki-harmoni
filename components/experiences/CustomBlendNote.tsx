import { DropletIcon } from "@/components/ui/icons";

/**
 * One callout doing the job two used to. There was a "create your own blend"
 * note here and, directly beneath it, a "Not sure which one feels right today?"
 * panel with a Help Me Choose button — two boxes back to back asking a version
 * of the same question, which made the page look like it was nagging.
 *
 * NO CTA, deliberately, and no WhatsApp link either. Choosing a blend happens
 * at the counter where the oils actually are; inviting people to message ahead
 * only creates a queue of "which one should I pick?" for staff to answer twice,
 * once by phone and again when the guest walks in. Asking on arrival is the
 * whole instruction, so the copy says only that.
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
            {/* No max-width. This paragraph is already inside a padded card in
                a constrained page shell, so capping it again at 2xl left a
                ragged margin of empty gradient down the right of every line. */}
            <p className="mt-1.5 text-[16px] leading-relaxed text-brown">
              Tell us how you&apos;re feeling and we&apos;ll help you choose — or we&apos;ll make
              you something of your own. Beyond the four signature soaks we can mix and match{" "}
              <strong className="text-olive-dark">7 aromatic oils</strong> and{" "}
              <strong className="text-olive-dark">3 herbal spa salts</strong> into a blend just for
              you. Just ask when you arrive.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
