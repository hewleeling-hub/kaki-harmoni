import { redirect } from "next/navigation";
import { MARKETING_CONSENT_LABEL } from "@/config/consent";
import { businessConfig } from "@/config/business";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth";
import { customerRef } from "@/lib/customer";

export const metadata = {
  title: "Consent list — print",
  robots: { index: false, follow: false },
};

type Row = {
  customer_no: number | null;
  name: string | null;
  phone: string | null;
  created_at: string;
  marketing_consent?: boolean | null;
};

/**
 * A printed list of the customers who have not yet agreed to receive offers, to
 * carry to the counter and ask in person.
 *
 * One line per PERSON, not per sign-up row: the same guest can have several rows
 * (signups dedupe on email, which is optional), and asking someone twice because
 * they appear twice is exactly the kind of thing that annoys them. Grouped on
 * the customer number, which every row on one phone number shares.
 *
 * Counts a person as already agreed if ANY of their rows says so, and leaves
 * them off the list.
 *
 * Works before and after the consent columns exist: until migration 0025 is
 * applied nobody has agreed, so asking for the column would fail; it falls back
 * to listing everyone with a phone number.
 *
 * It is a page of customers' names and phone numbers. Staff-only, and the
 * paper should be treated like the database: kept out of sight, not left on the
 * counter, and shredded once the ticks have been entered.
 */
export default async function ConsentListPage() {
  const user = await requireStaff();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const full = await admin
    .from("signups")
    .select("customer_no, name, phone, created_at, marketing_consent")
    .not("phone", "is", null)
    .not("status", "like", "enquiry%");

  let rows: Row[];
  if (full.error) {
    const plain = await admin.from("signups").select("customer_no, name, phone, created_at").not("phone", "is", null)
    .not("status", "like", "enquiry%");
    rows = (plain.data ?? []) as Row[];
  } else {
    rows = (full.data ?? []) as Row[];
  }

  // One entry per person; remember if any of their rows already agreed.
  const people = new Map<string, { row: Row; agreed: boolean }>();
  for (const r of rows) {
    if (!r.phone?.trim()) continue;
    const key = r.customer_no != null ? `no:${r.customer_no}` : `phone:${r.phone}`;
    const seen = people.get(key);
    const agreed = r.marketing_consent === true;
    if (!seen) people.set(key, { row: r, agreed });
    else {
      seen.agreed = seen.agreed || agreed;
      // Keep the oldest row's name: it is the one the customer number was issued on.
      if (r.created_at < seen.row.created_at) seen.row = { ...r };
    }
  }

  const list = [...people.values()]
    .filter((p) => !p.agreed)
    .map((p) => p.row)
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" }));

  const printed = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kuala_Lumpur" });

  return (
    <>
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          [data-dashboard-chrome] { display: none !important; }
          [data-dashboard-main],
          [data-dashboard-main] > div { padding: 0 !important; max-width: none !important; }
          thead { display: table-header-group; }
          tr { break-inside: avoid; }
        }
      `}</style>

      <div className="no-print mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-black/10 bg-amber-50 p-4 text-sm">
        <p className="flex-1 text-black/70">
          {list.length} customer{list.length === 1 ? "" : "s"} who haven&apos;t agreed to offers yet. Print it, ask them
          at the counter, and tick the box for those who say yes. This sheet has customers&apos; phone numbers on it —
          keep it out of sight and shred it once the ticks are entered.
        </p>
        <a href="/dashboard/intake" className="rounded-lg border border-black/10 px-3 py-1.5 font-medium hover:bg-black/5">
          Back to intake
        </a>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white p-6 text-[12px] leading-snug text-black print:p-0">
        <header className="border-b-2 border-black/70 pb-2">
          <p className="text-[16px] font-bold">{businessConfig.name} — offers permission list</p>
          <p className="mt-1 text-[10.5px]">
            Ask each customer: <span className="font-semibold">&ldquo;{MARKETING_CONSENT_LABEL}&rdquo;</span> Tick only if they say yes, and
            ask them to initial. Printed {printed}.
          </p>
        </header>

        {list.length === 0 ? (
          <p className="mt-4 text-black/60">Everyone on file has already agreed — nothing to ask.</p>
        ) : (
          <table className="mt-3 w-full border-collapse text-[11.5px]">
            <thead>
              <tr className="border-b border-black/60 text-left">
                <th className="w-12 py-1 pr-2 font-semibold">No.</th>
                <th className="py-1 pr-2 font-semibold">Name</th>
                <th className="w-36 py-1 pr-2 font-semibold">Phone</th>
                <th className="w-14 py-1 pr-2 text-center font-semibold">Yes</th>
                <th className="w-24 py-1 font-semibold">Initials</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={`${r.customer_no ?? "x"}-${i}`} className="border-b border-black/15">
                  <td className="py-1.5 pr-2 text-black/60">{r.customer_no != null ? customerRef(r.customer_no) : ""}</td>
                  <td className="py-1.5 pr-2">{r.name ?? "—"}</td>
                  <td className="py-1.5 pr-2">{r.phone}</td>
                  <td className="py-1.5 pr-2 text-center">
                    <span className="inline-block h-[13px] w-[13px] border border-black/70 align-middle" />
                  </td>
                  <td className="py-1.5">
                    <span className="inline-block w-full border-b border-black/40">&nbsp;</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </>
  );
}
