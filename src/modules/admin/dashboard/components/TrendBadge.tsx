import { ArrowDown, ArrowUp } from "lucide-react";

import type { TrendTone } from "@/modules/admin/dashboard/types";
import { cn } from "@/shared/lib/utils";

interface TrendBadgeProps {
  variation: string;
  tone: TrendTone;
}

export function TrendBadge({ variation, tone }: TrendBadgeProps) {
  const isPositive = tone === "positive";

  return (
    <p
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        isPositive ? "kpi-trend-up" : "kpi-trend-down",
      )}
    >
      {isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      {variation}
    </p>
  );
}
