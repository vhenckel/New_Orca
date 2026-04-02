import type { RenegotiationDailyRow } from "@/modules/debt-negotiation/types/renegotiation-details";

export type DailyRowsMonthGroup = {
  monthKey: string;
  rows: RenegotiationDailyRow[];
};

export function groupDailyRowsByMonth(values: RenegotiationDailyRow[]): DailyRowsMonthGroup[] {
  const map = new Map<string, RenegotiationDailyRow[]>();
  for (const row of values) {
    const key = row.date.slice(0, 7);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  const keys = [...map.keys()].sort();
  return keys.map((monthKey) => ({
    monthKey,
    rows: (map.get(monthKey) ?? []).sort((a, b) => a.date.localeCompare(b.date)),
  }));
}

export function formatMonthNavLabel(monthKey: string, locale: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  const loc = locale === "en-US" ? "en-US" : "pt-BR";
  return d.toLocaleDateString(loc, { month: "short", year: "numeric" });
}
