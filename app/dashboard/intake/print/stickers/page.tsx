import { redirect } from "next/navigation";
import { MARKETING_CONSENT_LABEL } from "@/config/consent";
import { requireStaff } from "@/lib/auth";

export const metadata = {
  title: "Consent stickers — print",
  robots: { index: false, follow: false },
};

/**
 * A sheet of "offers on WhatsApp" slips, for the intake forms already printed.
 *
 * Reprinting a stack of forms to add one tick-box is wasteful; this prints the
 * same sentence (config/consent.ts — one source, so the sticker and the printed
 * form can never say different things) as slips to cut out and stick or glue
 * onto a form next to its Consent section. The guest ticks AND initials, so
 * their agreement is tied to them even though the slip went on after the form.
 *
 * Same guard as the form page, and for the same reason: this page awaits
 * nothing else, so without awaiting the login here it would render for anyone
 * who guessed the URL.
 */
export default async function ConsentStickersPage() {
  const user = await requireStaff();
  if (!user) redirect("/login");

  return (
    <>
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          [data-dashboard-chrome] { display: none !important; }
          [data-dashboard-main],
          [data-dashboard-main] > div {
            padding: 0 !important;
            max-width: none !important;
          }
        }
      `}</style>

      <div className="no-print mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-black/10 bg-amber-50 p-4 text-sm">
        <p className="flex-1 text-black/70">
          Print this on plain paper and cut along the dashed lines, or on sticky label paper. Stick one next
          to the Consent section of each printed form. The guest ticks the box and writes their initials.
        </p>
        <a
          href="/dashboard/intake"
          className="rounded-lg border border-black/10 px-3 py-1.5 font-medium hover:bg-black/5"
        >
          Back to intake
        </a>
      </div>

      <div className="mx-auto grid max-w-[190mm] grid-cols-2 bg-white text-black">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="break-inside-avoid border border-dashed border-black/40 p-2.5 text-[10.5px] leading-snug"
            style={{ height: "27mm" }}
          >
            <div className="flex items-start gap-1.5">
              <span className="mt-[2px] inline-block h-[13px] w-[13px] shrink-0 border border-black/70" />
              <span>{MARKETING_CONSENT_LABEL}</span>
            </div>
            <p className="mt-2 text-[10px] text-black/70">Initials: ______________</p>
          </div>
        ))}
      </div>
    </>
  );
}
