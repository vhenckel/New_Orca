import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

export function RenegotiationConfigFormRow({
  label,
  warning,
  info,
  children,
  className,
}: {
  label: ReactNode;
  warning?: string;
  info?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {info ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-sm hover:bg-muted">
                <Info className="text-primary" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" className="max-w-xs">
              {info}
            </TooltipContent>
          </Tooltip>
        ) : null}
        {label}
      </div>
      <div className="min-w-0 pt-1">
        {children}
        {warning ? <div className="mt-1 text-xs text-destructive">{warning}</div> : null}
      </div>
    </div>
  );
}
