import { packageValidityLabel } from "@/config/business";

/** Soaks in a package, from its catalogue name ("5-Day Reset" → 5). Null for anything else. */
export function packageSize(productName: string | null | undefined): number | null {
  const m = /^(\d+)-Day\b/i.exec(productName ?? "");
  const n = m ? Number(m[1]) : NaN;
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * The last day a package can be used: the same calendar day six months after it
 * was paid, clamped to month end (paid 31 Aug → 28 Feb). The policy text is
 * packageValidityLabel; if that ever changes this must change with it.
 */
export const PACKAGE_VALIDITY_MONTHS = 6;
if (packageValidityLabel !== "6 months") {
  throw new Error("packageValidityLabel changed — update PACKAGE_VALIDITY_MONTHS in lib/packages.ts");
}

export function packageExpiry(paidOn: string): string {
  const [y, m, d] = paidOn.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + PACKAGE_VALIDITY_MONTHS, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
}
