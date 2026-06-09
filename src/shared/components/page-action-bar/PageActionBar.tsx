import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type PageActionBarProps = {
  children: ReactNode;
  className?: string;
};

/** Ações de página alinhadas à direita; coloque a ação primária por último. */
export function PageActionBar({ children, className }: PageActionBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-2", className)}>
      {children}
    </div>
  );
}
