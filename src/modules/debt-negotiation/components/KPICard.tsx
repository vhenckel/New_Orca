import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  percentage?: string;
  delay?: number;
  onClick?: () => void;
}

export function KPICard({
  label,
  value,
  change,
  trend,
  percentage,
  delay = 0,
  onClick,
}: KPICardProps) {
  const className = cn(
    "card-surface animate-fade-in p-5 opacity-0 w-full text-left transition-opacity",
    onClick && "cursor-pointer hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  );
  const style = { animationDelay: `${delay}ms` } as const;

  if (onClick) {
    return (
      <button type="button" className={className} style={style} onClick={onClick}>
        <KPICardInner
          label={label}
          value={value}
          change={change}
          trend={trend}
          percentage={percentage}
        />
      </button>
    );
  }

  return (
    <div className={className} style={style}>
      <KPICardInner label={label} value={value} change={change} trend={trend} percentage={percentage} />
    </div>
  );
}

function KPICardInner({
  label,
  value,
  change,
  trend,
  percentage,
}: Pick<KPICardProps, "label" | "value" | "change" | "trend" | "percentage">) {
  return (
    <>
      <div className="flex items-start justify-between">
        <span className="kpi-label">{label}</span>
        {percentage && <span className="text-xs font-medium text-muted-foreground">{percentage}</span>}
      </div>
      <div className="mt-2 font-mono kpi-value">{value}</div>
      <div className="mt-2 flex items-center gap-1">
        {trend === "up" ? (
          <TrendingUp className="size-3 text-success" />
        ) : (
          <TrendingDown className="size-3 text-destructive" />
        )}
        <span className={cn(trend === "up" ? "kpi-trend-up" : "kpi-trend-down")}>{change}</span>
      </div>
    </>
  );
}
