import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  percentage?: string;
  delay?: number;
}

export function KPICard({ label, value, change, trend, percentage, delay = 0 }: KPICardProps) {
  return (
    <div className="card-surface animate-fade-in p-5 opacity-0" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <span className="kpi-label">{label}</span>
        {percentage && <span className="text-xs font-medium text-muted-foreground">{percentage}</span>}
      </div>
      <div className="mt-2 font-mono kpi-value">{value}</div>
      <div className="mt-2 flex items-center gap-1">
        {trend === "up" ? (
          <TrendingUp className="h-3 w-3 text-success" />
        ) : (
          <TrendingDown className="h-3 w-3 text-destructive" />
        )}
        <span className={cn(trend === "up" ? "kpi-trend-up" : "kpi-trend-down")}>{change}</span>
      </div>
    </div>
  );
}
