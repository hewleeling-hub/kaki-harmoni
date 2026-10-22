import { createFinancialsClient } from "@/lib/supabase/financials";

// Management reports built straight from the ledger: profit and loss, and
// balance sheet. Both are derived, never stored — run them whenever the month's
// transactions are posted and they reflect the ledger as it stands.
//
// Sign convention throughout: amounts are held as net DEBIT (debits less
// credits), which is how the journal stores them. Revenue and liabilities
// therefore carry a negative net debit and are flipped for display.

export type Period = { key: string; label: string; start: string; end: string };

type Account = {
  code: string;
  name: string;
  account_type: string;
  statement_group: string | null;
  sort_order: number | null;
};

type Movement = { month: number; itd: number };

export type ReportLine = { code: string; name: string; month: number; itd: number };

export type ProfitAndLoss = {
  revenue: ReportLine[];
  grossRevenue: Movement;
  discounts: ReportLine[];
  netRevenue: Movement;
  costOfSales: ReportLine[];
  totalCostOfSales: Movement;
  grossProfit: Movement;
  operatingExpenses: ReportLine[];
  totalOperatingExpenses: Movement;
  profit: Movement;
};

export type BalanceSheet = {
  nonCurrent: ReportLine[];
  totalCost: number;
  accumulatedDepreciation: ReportLine[];
  totalAccumulatedDepreciation: number;
  netBookValue: number;
  current: ReportLine[];
  totalCurrent: number;
  totalAssets: number;
  liabilities: ReportLine[];
  totalLiabilities: number;
  shareCapital: number;
  accumulatedLoss: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  outOfBalanceBy: number;
};

export type ReportData = {
  period: Period;
  periods: Period[];
  profitAndLoss: ProfitAndLoss;
  balanceSheet: BalanceSheet;
  journalCount: number;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function lastDay(year: number, month1: number) {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

export function periodFromKey(key: string): Period {
  const [y, m] = key.split("-").map(Number);
  const end = `${key}-${String(lastDay(y, m)).padStart(2, "0")}`;
  return { key, label: `${MONTHS[m - 1]} ${y}`, start: `${key}-01`, end };
}

// Supabase caps a select at 1000 rows by default; the ledger will outgrow that,
// so page through explicitly rather than silently truncating the reports.
async function fetchAll<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  build: (from: number, to: number) => any,
): Promise<T[]> {
  const size = 1000;
  const out: T[] = [];
  for (let from = 0; ; from += size) {
    const { data, error } = await build(from, from + size - 1);
    if (error) throw new Error(error.message);
    const batch = (data ?? []) as T[];
    out.push(...batch);
    if (batch.length < size) return out;
  }
}

export async function loadReportData(periodKey?: string): Promise<ReportData | null> {
  const supabase = createFinancialsClient();
  if (!supabase) return null;

  const accounts = await fetchAll<Account>((from, to) =>
    supabase
      .from("accounts")
      .select("code,name,account_type,statement_group,sort_order")
      .order("code")
      .range(from, to),
  );

  const journals = await fetchAll<{ id: string; entry_date: string }>((from, to) =>
    supabase.from("journals").select("id,entry_date").order("entry_date").range(from, to),
  );

  const lines = await fetchAll<{
    journal_id: string;
    account_code: string;
    debit: string | number | null;
    credit: string | number | null;
  }>((from, to) =>
    supabase
      .from("journal_lines")
      .select("journal_id,account_code,debit,credit")
      .order("journal_id")
      .range(from, to),
  );

  const dateOf = new Map(journals.map((j) => [j.id, j.entry_date]));

  // Every month that carries at least one journal, newest first.
  const monthKeys = [...new Set(journals.map((j) => j.entry_date.slice(0, 7)))].sort();
  const periods = monthKeys.map(periodFromKey).reverse();
  if (periods.length === 0) return null;

  const period =
    periods.find((p) => p.key === periodKey) ?? periods[0];

  const byAccount = new Map<string, Movement>();
  for (const line of lines) {
    const date = dateOf.get(line.journal_id);
    if (!date || date > period.end) continue;
    const net = Number(line.debit ?? 0) - Number(line.credit ?? 0);
    const entry = byAccount.get(line.account_code) ?? { month: 0, itd: 0 };
    entry.itd += net;
    if (date >= period.start) entry.month += net;
    byAccount.set(line.account_code, entry);
  }

  const journalCount = journals.filter((j) => j.entry_date <= period.end).length;

  const round = (n: number) => Math.round(n * 100) / 100;
  const used = accounts.filter((a) => {
    const m = byAccount.get(a.code);
    return m && (round(m.itd) !== 0 || round(m.month) !== 0);
  });
  const sorted = [...used].sort(
    (a, b) => (a.sort_order ?? Number(a.code)) - (b.sort_order ?? Number(b.code)),
  );

  const movement = (code: string) => byAccount.get(code) ?? { month: 0, itd: 0 };
  const line = (a: Account, flip = false): ReportLine => {
    const m = movement(a.code);
    const s = flip ? -1 : 1;
    return { code: a.code, name: a.name, month: round(m.month * s), itd: round(m.itd * s) };
  };
  const sum = (ls: ReportLine[]): Movement => ({
    month: round(ls.reduce((t, l) => t + l.month, 0)),
    itd: round(ls.reduce((t, l) => t + l.itd, 0)),
  });
  const less = (a: Movement, b: Movement): Movement => ({
    month: round(a.month - b.month),
    itd: round(a.itd - b.itd),
  });

  // ---- profit and loss ----
  const pl = sorted.filter((a) => a.statement_group === "profit_loss");
  const revenue = pl.filter((a) => a.account_type === "revenue").map((a) => line(a, true));
  const discounts = pl.filter((a) => a.account_type === "contra_revenue").map((a) => line(a, true));
  const costOfSales = pl.filter((a) => a.account_type === "expense" && a.code.startsWith("5")).map((a) => line(a));
  const operatingExpenses = pl
    .filter((a) => a.account_type === "expense" && !a.code.startsWith("5"))
    .map((a) => line(a));

  const grossRevenue = sum(revenue);
  // Discounts are flipped above, so they arrive negative and add to revenue.
  const netRevenue = { month: round(grossRevenue.month + sum(discounts).month), itd: round(grossRevenue.itd + sum(discounts).itd) };
  const totalCostOfSales = sum(costOfSales);
  const grossProfit = less(netRevenue, totalCostOfSales);
  const totalOperatingExpenses = sum(operatingExpenses);
  const profit = less(grossProfit, totalOperatingExpenses);

  // ---- balance sheet ----
  const bs = sorted.filter((a) => a.statement_group === "balance_sheet");
  const nonCurrent = bs.filter((a) => a.code.startsWith("15")).map((a) => line(a));
  const accumulatedDepreciation = bs.filter((a) => a.code.startsWith("16")).map((a) => line(a));
  const current = bs
    .filter((a) => a.account_type === "asset" && !a.code.startsWith("15"))
    .map((a) => line(a));
  const liabilities = bs.filter((a) => a.account_type === "liability").map((a) => line(a, true));
  const equityAccounts = bs.filter((a) => a.account_type === "equity").map((a) => line(a, true));

  const totalCost = sum(nonCurrent).itd;
  const totalAccumulatedDepreciation = sum(accumulatedDepreciation).itd;
  const netBookValue = round(totalCost + totalAccumulatedDepreciation);
  const totalCurrent = sum(current).itd;
  const totalAssets = round(netBookValue + totalCurrent);
  const totalLiabilities = sum(liabilities).itd;
  const shareCapital = sum(equityAccounts).itd;
  // Retained earnings are not a posted account: the loss to date IS the balance.
  const accumulatedLoss = profit.itd;
  const totalEquity = round(shareCapital + accumulatedLoss);
  const totalLiabilitiesAndEquity = round(totalLiabilities + totalEquity);

  return {
    period,
    periods,
    journalCount,
    profitAndLoss: {
      revenue, grossRevenue, discounts, netRevenue,
      costOfSales, totalCostOfSales, grossProfit,
      operatingExpenses, totalOperatingExpenses, profit,
    },
    balanceSheet: {
      nonCurrent, totalCost,
      accumulatedDepreciation, totalAccumulatedDepreciation, netBookValue,
      current, totalCurrent, totalAssets,
      liabilities, totalLiabilities,
      shareCapital, accumulatedLoss, totalEquity, totalLiabilitiesAndEquity,
      outOfBalanceBy: round(totalAssets - totalLiabilitiesAndEquity),
    },
  };
}
