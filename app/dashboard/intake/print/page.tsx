import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { businessConfig } from "@/config/business";
import {
  HEALTH_CONDITIONS,
  HEALTH_GOALS,
  AROMA_OILS,
  SPA_SALTS,
  WATER_LEVELS,
  WATER_TEMPS,
  INTENSITIES,
  DURATIONS,
  MAX_AROMA_OILS,
  AROMA_OIL_PURPOSE,
  HEALTH_STOP_NOTE,
} from "@/config/intake";

export const metadata = {
  title: "Intake form — print",
  robots: { index: false, follow: false },
};

/**
 * The paper form, printed from the same lists the dashboard ticks.
 *
 * That shared source is the whole point. A printed pad and a screen drift
 * apart the moment somebody adds an oil to one of them — then staff are
 * copying an answer that has no box to go in. Change config/intake.ts and both
 * the paper and the screen change together.
 *
 * Lives under /dashboard, so it is behind the login like everything else here.
 * Nothing about it is customer-facing until it comes out of a printer.
 *
 * It checks the login itself as well as inheriting the layout's, and that is
 * not belt-and-braces here — it is load-bearing. Every other page in the
 * dashboard awaits a query, so the layout's redirect lands before anything
 * renders. This page awaits nothing, so it rendered its whole body into the
 * response alongside the 307 and served the blank form to anyone who guessed
 * the URL. Awaiting the guard here is what stops that.
 */

function Box({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="inline-block h-[13px] w-[13px] shrink-0 border border-black/60" />
      {label}
    </span>
  );
}

function Rule({ label, width = "100%" }: { label: string; width?: string }) {
  return (
    <span className="inline-flex items-baseline gap-2" style={{ width }}>
      <span className="shrink-0">{label}</span>
      <span className="grow border-b border-dotted border-black/50" />
    </span>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-3 break-inside-avoid">
      <h2 className="border-b border-black/25 pb-0.5 text-[11px] font-bold uppercase tracking-[0.12em]">
        {n}. {title}
      </h2>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}

export default async function IntakePrintPage() {
  const user = await requireStaff();
  if (!user) redirect("/login");

  return (
    <>
      {/* Print rules live here rather than in globals.css: they are only ever
          wanted on this one page, and a global @page margin would follow every
          other page to the printer too. */}
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          /* The dashboard chrome is a sidebar and a header; neither belongs on
             a sheet of paper handed to a guest. And with the sidebar gone, the
             left padding that made room for it would push the sheet off the
             page, so the wrapper goes back to full width too. */
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
          Print a stack of these for the counter. One per guest, per visit — they fill it in and
          sign, you scan it back in afterwards.
        </p>
        <a
          href="/dashboard/intake"
          className="rounded-lg border border-black/10 px-3 py-1.5 font-medium hover:bg-black/5"
        >
          Back to intake
        </a>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white p-6 text-[12px] leading-snug text-black print:p-0">
        <header className="flex items-end justify-between border-b-2 border-black/70 pb-2">
          <div>
            <p className="text-[19px] font-bold tracking-tight">{businessConfig.name}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/60">
              {businessConfig.tagline}
            </p>
          </div>
          <div className="text-right text-[10px] text-black/60">
            <p className="text-[13px] font-bold uppercase tracking-wide text-black">
              Guest intake &amp; consent
            </p>
            <p>{businessConfig.address.name}</p>
            <p>
              {businessConfig.callDisplay} · {businessConfig.hours.display}
            </p>
          </div>
        </header>

        <div className="mt-2 flex gap-6 text-[11px]">
          <Rule label="Date" width="40%" />
          <Rule label="Customer no." width="28%" />
          <Rule label="Voucher no." width="28%" />
        </div>

        <Section n="1" title="Your details">
          <div className="flex flex-col gap-2.5">
            <div className="flex gap-6">
              <Rule label="Name" width="58%" />
              <Rule label="Contact no." width="38%" />
            </div>
            <div className="flex gap-6">
              <Rule label="IC / Passport no." width="48%" />
              <Rule label="Who referred you (if anyone)" width="48%" />
            </div>
          </div>
        </Section>

        <Section n="2" title="Before you soak — please tick anything that applies to you">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {HEALTH_CONDITIONS.map((c) => (
              <Box key={c} label={c} />
            ))}
          </div>
          <p className="mt-2 text-[10.5px] font-semibold leading-relaxed">{HEALTH_STOP_NOTE}</p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-black/70">
            Otherwise none of these stops you having a soak. We ask so our team knows when to take
            extra care, and so we can suggest what suits you. If you have a health condition,
            we&apos;d suggest a quick word with your doctor beforehand.
          </p>
        </Section>

        <Section n="3" title="What would you like from today?">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {HEALTH_GOALS.map((g) => (
              <Box key={g} label={g} />
            ))}
          </div>
        </Section>

        <Section n="4" title="Consent">
          <p className="text-[10.5px] leading-relaxed">
            I confirm the information above is correct, and that I have told the team about
            anything they should know before my soak. I understand a Kaki Harmoni soak is a warm
            foot and leg bath for relaxation, and is not a medical treatment or a substitute for
            advice from a doctor.
          </p>
          <div className="mt-4 flex items-end gap-8">
            <Rule label="Signature" width="52%" />
            <Rule label="Date" width="28%" />
          </div>
        </Section>

        {/* Everything below is filled in by the team, not the guest — boxed off
            so nobody hands the sheet back half-completed in the wrong half. */}
        <section className="mt-4 break-inside-avoid border-2 border-black/70 p-2.5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em]">
            For our team — treatment record
          </h2>

          <div className="mt-2 flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1.5">
              <span className="font-semibold">Water level:</span>
              {WATER_LEVELS.map((v) => (
                <Box key={v} label={v} />
              ))}
              <span className="ml-2 font-semibold">Temp:</span>
              {WATER_TEMPS.map((v) => (
                <Box key={v} label={v} />
              ))}
            </div>

            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1.5">
              <span className="font-semibold">Intensity:</span>
              {INTENSITIES.map((v) => (
                <Box key={v} label={v} />
              ))}
              <span className="ml-2 font-semibold">Minutes:</span>
              {DURATIONS.map((v) => (
                <Box key={v} label={v} />
              ))}
            </div>

            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
              <span className="font-semibold">Oils used (max {MAX_AROMA_OILS}):</span>
              {AROMA_OILS.map((o) => (
                <Box
                  key={o}
                  label={AROMA_OIL_PURPOSE[o] ? `${o} (${AROMA_OIL_PURPOSE[o]})` : o}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
              <span className="font-semibold">Salt used:</span>
              {SPA_SALTS.map((s) => (
                <Box key={s} label={s} />
              ))}
              <Rule label="Suggested next time" width="38%" />
            </div>

            <div className="flex gap-6 pt-0.5">
              <Rule label="Served by" width="34%" />
              <Rule label="Notes" width="62%" />
            </div>
            <span className="mt-1 block w-full border-b border-dotted border-black/50" />
          </div>
        </section>

        <footer className="mt-3 flex items-center justify-between border-t border-black/25 pt-1.5 text-[9px] text-black/50">
          <span>
            {businessConfig.legalName} · SSM {businessConfig.ssm}
          </span>
          <span>Scanned and filed after the visit · KH-INTAKE-A4</span>
        </footer>
      </article>
    </>
  );
}
