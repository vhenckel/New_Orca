import { AlertTriangle } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { useI18n } from "@/shared/i18n/useI18n";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { getStageI18nKey, statusBadgeClass } from "./statusBadgeClass";

interface StatusBadgeProps {
  stageName: string;
  showAlert?: boolean;
  alertMessage?: string;
}

export function StatusBadge({
  stageName,
  showAlert = false,
  alertMessage,
}: StatusBadgeProps) {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
          statusBadgeClass(stageName),
        )}
      >
        {t(getStageI18nKey(stageName))}
      </span>
      {showAlert && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
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
