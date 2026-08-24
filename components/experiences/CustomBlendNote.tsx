import { DropletIcon } from "@/components/ui/icons";

/**
 * Callout: beyond the 4 signature blends, we can tailor a custom blend.
 * No CTA by design — the copy says to ask when you arrive, so a "message us"
 * button would send people somewhere the instruction doesn't ask them to go.
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
            <h3 className="text-[22px] text-olive-dark sm:text-[24px]">Or create your own blend</h3>
            <p className="mt-1.5 max-w-2xl text-[16px] leading-relaxed text-brown">
              Beyond our four signature soaks, our team can tailor a blend just for you — mix and match from{" "}
              <strong className="text-olive-dark">7 aromatic oils</strong> and{" "}
              <strong className="text-olive-dark">3 herbal spa salts</strong> to suit exactly how you&apos;re feeling.
              Just ask when you arrive.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
