import { AlertTriangle } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n/useI18n";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import {
  getStageI18nKey,
  statusBadgeClass,
} from "@/modules/debt-negotiation/utils/statusBadgeClass";

interface StatusBadgeProps {
  stageName: string;
  showAlert?: boolean;
  alertMessage?: string;
  /** Largura da célula (px); o pai controla layout, não o badge. */
  columnWidthClamp?: { min: number; max: number };
}

export function StatusBadge({
  stageName,
  showAlert = false,
  alertMessage,
  columnWidthClamp,
}: StatusBadgeProps) {
  const { t } = useI18n();
  const constrained =
    columnWidthClamp != null &&
    columnWidthClamp.min > 0 &&
    columnWidthClamp.max >= columnWidthClamp.min;
  return (
    <span
      className={cn(
        "items-center gap-1",
        constrained ? "flex w-full min-w-0 max-w-full" : "inline-flex",
      )}
      style={
        constrained
          ? {
              minWidth: columnWidthClamp.min,
              maxWidth: columnWidthClamp.max,
              width: "100%",
            }
          : undefined
      }
    >
      <span
        className={cn(
            "rounded-full px-3 py-1 text-xs font-medium leading-tight whitespace-nowrap",
          statusBadgeClass(stageName),
          constrained
            ? cn(
                "flex min-h-6 min-w-0 items-center justify-center",
                  showAlert ? "flex-1" : "w-full",
              )
            : "inline-flex text-center",
        )}
      >
          <span
            className={cn(
              constrained ? "w-full text-center" : "text-center",
            )}
          >
            {t(getStageI18nKey(stageName))}
          </span>
      </span>
      {showAlert && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex shrink-0">
              <AlertTriangle className="size-4 text-[hsl(var(--warning))]" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            {alertMessage}
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
