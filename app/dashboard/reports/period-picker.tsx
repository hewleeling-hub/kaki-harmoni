"use client";

import { useRouter } from "next/navigation";
import type { Period } from "@/lib/reports";

export default function PeriodPicker({
  periods,
  selected,
}: {
  periods: Period[];
  selected: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 print:hidden">
      <label htmlFor="period" className="text-sm text-black/60">
        Period
      </label>
      <select
        id="period"
        value={selected}
        onChange={(e) => router.push(`/dashboard/reports?period=${e.target.value}`)}
        className="text-sm px-3 py-2 rounded-lg border border-black/10 bg-white"
      >
        {periods.map((p) => (
          <option key={p.key} value={p.key}>
            {p.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => window.print()}
        className="text-sm font-medium px-3 py-2 rounded-lg border border-black/10 hover:bg-black/5"
      >
        Print
      </button>
    </div>
  );
}
