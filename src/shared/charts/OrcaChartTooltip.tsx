import type { TooltipProps } from "recharts";

import { cn } from "@/shared/lib/utils";

export function orcaTooltipContentStyle() {
  return {
    borderRadius: 10,
    border: "1px solid hsl(var(--border))",
    backgroundColor: "hsl(var(--card))",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
    fontSize: 12,
    color: "hsl(var(--foreground))",
  } as const;
}

export function OrcaChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-card",
      )}
    >
      {label != null && (
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          {labelFormatter ? labelFormatter(label, payload) : String(label)}
        </p>
      )}
      <div className="flex flex-col gap-0.5">
        {payload.map((entry) => (
          <p key={String(entry.dataKey)} className="font-medium text-foreground">
            {entry.name != null && (
              <span className="text-muted-foreground">{entry.name}: </span>
            )}
            {formatter
              ? formatter(entry.value, entry.name ?? "", entry, 0, payload)
              : entry.value}
          </p>
        ))}
      </div>
    </div>
  );
}
