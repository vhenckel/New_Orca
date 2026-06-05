import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

export type KpiTrendTone = "positive" | "negative" | "neutral";

interface KpiCardProps {
  label: string;
  value: string;
  trend?: string;
  trendTone?: KpiTrendTone;
  icon?: LucideIcon;
  className?: string;
}

function trendClass(tone: KpiTrendTone) {
  if (tone === "positive") return "kpi-trend-up";
  if (tone === "negative") return "kpi-trend-down";
  return "text-xs font-medium text-muted-foreground";
}

export function KpiCard({
  label,
  value,
  trend,
  trendTone = "neutral",
  icon: Icon,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("shadow-card", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="kpi-label">{label}</p>
            <p className="kpi-value">{value}</p>
          </div>
          {Icon && (
            <Icon className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
        </div>
      </CardHeader>
      {trend && (
        <CardContent className="pt-0">
          <p className={cn("flex items-center gap-1", trendClass(trendTone))}>
            {trendTone === "positive" && <ArrowUp className="size-3" />}
            {trendTone === "negative" && <ArrowDown className="size-3" />}
            {trend}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
