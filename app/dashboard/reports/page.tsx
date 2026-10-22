import { redirect } from "next/navigation";
import { getProfile, isManager } from "@/lib/auth";
import { loadReportData, type ReportLine } from "@/lib/reports";
import PeriodPicker from "./period-picker";

export const dynamic = "force-dynamic";

const fmt = (n: number) =>
  n < 0
    ? `(${Math.abs(n).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
    : n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!isManager(profile.role)) redirect("/dashboard");

  const { period: periodKey } = await searchParams;
  const data = await loadReportData(periodKey);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
            Reports
          </h1>
          <p className="text-black/60 mt-1">
            Profit and loss and balance sheet, built from the ledger as it stands.
          </p>
        </div>
        {data && <PeriodPicker periods={data.periods} selected={data.period.key} />}
      </div>

      {!data ? <NotConfigured /> : <Statements data={data} />}
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 space-y-3">
      <h2 className="font-semibold">Not connected to the bookkeeping database yet</h2>
      <p className="text-sm text-black/70">
        The ledger lives in a separate Supabase project from this app, so the reports need their own
        read-only connection. Add these two server-side environment variables in Vercel, then
        redeploy:
      </p>
      <pre className="text-xs bg-black/[0.04] rounded-lg p-3 overflow-x-auto">
{`FINANCIALS_SUPABASE_URL
FINANCIALS_SUPABASE_SERVICE_ROLE_KEY`}
      </pre>
      <p className="text-sm text-black/60">
        Both belong to the <strong>kaki-harmoni-financials</strong> project. Neither may be prefixed
        with <code>NEXT_PUBLIC_</code> — the service role key bypasses row level security and must
        never reach the browser.
      </p>
    </div>
  );
}

function Statements({ data }: { data: NonNullable<Awaited<ReturnType<typeof loadReportData>>> }) {
  const { period, profitAndLoss: pl, balanceSheet: bs, journalCount } = data;

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-black/10 bg-white overflow-hidden">
        <Header
          title="Profit and loss"
          subtitle={`${period.label}, and inception to ${period.end.split("-").reverse().join("/")}`}
        />
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-black/[0.03]">
              <Th>Account</Th>
              <Th className="w-16">A/C</Th>
              <Th className="text-right w-36">{period.label}</Th>
              <Th className="text-right w-36">To date</Th>
            </tr>
          </thead>
          <tbody>
            <GroupRow label="Revenue" />
            {pl.revenue.map((l) => <Row key={l.code} line={l} />)}
            <TotalRow label="Gross revenue" month={pl.grossRevenue.month} itd={pl.grossRevenue.itd} />
            {pl.discounts.map((l) => <Row key={l.code} line={l} />)}
            <TotalRow label="Net revenue" month={pl.netRevenue.month} itd={pl.netRevenue.itd} strong />

            <GroupRow label="Cost of sales" />
            {pl.costOfSales.map((l) => <Row key={l.code} line={l} />)}
            <TotalRow label="Total cost of sales" month={pl.totalCostOfSales.month} itd={pl.totalCostOfSales.itd} />
            <TotalRow label="Gross profit / (loss)" month={pl.grossProfit.month} itd={pl.grossProfit.itd} strong />

            <GroupRow label="Operating expenses" />
            {pl.operatingExpenses.map((l) => <Row key={l.code} line={l} />)}
            <TotalRow label="Total operating expenses" month={pl.totalOperatingExpenses.month} itd={pl.totalOperatingExpenses.itd} />
            <TotalRow label="Profit / (loss) for the period" month={pl.profit.month} itd={pl.profit.itd} strong highlight />
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-black/10 bg-white overflow-hidden">
        <Header title="Balance sheet" subtitle={`As at ${period.end.split("-").reverse().join("/")}`} />
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-black/[0.03]">
              <Th>Account</Th>
              <Th className="w-16">A/C</Th>
              <Th className="text-right w-36">RM</Th>
            </tr>
          </thead>
          <tbody>
            <GroupRow label="Non-current assets" cols={3} />
            {bs.nonCurrent.map((l) => <Row key={l.code} line={l} single />)}
            <TotalRow label="At cost" month={bs.totalCost} single />
            {bs.accumulatedDepreciation.map((l) => <Row key={l.code} line={l} single />)}
            <TotalRow label="Net book value" month={bs.netBookValue} single strong />

            <GroupRow label="Current assets" cols={3} />
            {bs.current.map((l) => <Row key={l.code} line={l} single />)}
            <TotalRow label="Total current assets" month={bs.totalCurrent} single />
            <TotalRow label="Total assets" month={bs.totalAssets} single strong highlight />

            <GroupRow label="Liabilities" cols={3} />
            {bs.liabilities.map((l) => <Row key={l.code} line={l} single />)}
            <TotalRow label="Total liabilities" month={bs.totalLiabilities} single strong />

            <GroupRow label="Equity" cols={3} />
            <tr className="border-t border-black/5">
              <td className="px-4 py-2 pl-8">Share capital</td>
              <td className="px-4 py-2 text-black/40 text-xs">3100</td>
              <td className="px-4 py-2 text-right tabular-nums">{fmt(bs.shareCapital)}</td>
            </tr>
            <tr className="border-t border-black/5">
              <td className="px-4 py-2 pl-8">Accumulated profit / (loss)</td>
              <td className="px-4 py-2" />
              <td className="px-4 py-2 text-right tabular-nums">{fmt(bs.accumulatedLoss)}</td>
            </tr>
            <TotalRow label="Total equity" month={bs.totalEquity} single strong />
            <TotalRow label="Total liabilities and equity" month={bs.totalLiabilitiesAndEquity} single strong highlight />
          </tbody>
        </table>
        <div className="px-4 py-3 text-xs border-t border-black/5">
          {bs.outOfBalanceBy === 0 ? (
            <span className="text-emerald-700">
              Balanced. Total assets agree with total liabilities and equity.
            </span>
          ) : (
            <span className="text-amber-700">
              Out of balance by RM {fmt(bs.outOfBalanceBy)} — the ledger does not foot, so these
              figures should not be relied on until that is found.
            </span>
          )}
        </div>
      </section>

      <p className="text-xs text-black/50">
        Derived from {journalCount.toLocaleString("en-MY")} journals posted up to {period.end}.
        Nothing here is stored — the reports recompute every time the page loads, so they always
        show the ledger as it stands. Figures are in Malaysian ringgit; brackets are credits.
      </p>
    </div>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="px-4 py-4 border-b border-black/5">
      <h2 className="font-display text-xl font-semibold" style={{ color: "var(--lagoon-dark)" }}>
        {title}
      </h2>
      <p className="text-xs text-black/50 mt-0.5">{subtitle}</p>
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2 font-medium text-black/60 text-xs ${className}`}>{children}</th>;
}

function GroupRow({ label, cols = 4 }: { label: string; cols?: number }) {
  return (
    <tr className="bg-black/[0.03]">
      <td colSpan={cols} className="px-4 py-2 font-semibold text-xs uppercase tracking-wide text-black/70">
        {label}
      </td>
    </tr>
  );
}

function Row({ line, single = false }: { line: ReportLine; single?: boolean }) {
  return (
    <tr className="border-t border-black/5">
      <td className="px-4 py-2 pl-8">{line.name}</td>
      <td className="px-4 py-2 text-black/40 text-xs">{line.code}</td>
      {!single && <td className="px-4 py-2 text-right tabular-nums">{fmt(line.month)}</td>}
      <td className="px-4 py-2 text-right tabular-nums">{fmt(line.itd)}</td>
    </tr>
  );
}

function TotalRow({
  label,
  month,
  itd,
  single = false,
  strong = false,
  highlight = false,
}: {
  label: string;
  month: number;
  itd?: number;
  single?: boolean;
  strong?: boolean;
  highlight?: boolean;
}) {
  return (
    <tr
      className={`border-t ${strong ? "border-black/20" : "border-black/5"} ${
        highlight ? "bg-emerald-50/60" : ""
      }`}
    >
      <td className={`px-4 py-2 ${strong ? "font-semibold" : "font-medium"}`}>{label}</td>
      <td className="px-4 py-2" />
      <td className={`px-4 py-2 text-right tabular-nums ${strong ? "font-semibold" : "font-medium"}`}>
        {fmt(month)}
      </td>
      {!single && (
        <td className={`px-4 py-2 text-right tabular-nums ${strong ? "font-semibold" : "font-medium"}`}>
          {fmt(itd ?? 0)}
        </td>
      )}
    </tr>
  );
}
