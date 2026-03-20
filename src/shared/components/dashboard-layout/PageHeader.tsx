import { type ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  const showHeaderBlock = Boolean(title || subtitle || actions);

  return (
    <header className={cn("flex flex-col gap-4", className)}>
      {showHeaderBlock && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            {title ? <h1 className="text-xl font-semibold text-foreground">{title}</h1> : null}
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      )}
    </header>
  );
}
