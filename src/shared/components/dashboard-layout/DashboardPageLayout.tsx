import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

import { KpiGrid } from "./KpiGrid";
import { PageHeader } from "./PageHeader";
import type { KpiItem } from "./types";

export type DashboardPageLayoutProps = {
  headerContent?: ReactNode;
  title?: string;
  subtitle?: string;
  /**
   * Quando true, exibe título e subtítulo no corpo da página (navegação no TopBar).
   */
  showPageHeader?: boolean;
  headerActions?: ReactNode;

  kpiContent?: ReactNode;
  kpiItems?: KpiItem[];
  isLoadingKpis?: boolean;

  children?: ReactNode;
  className?: string;
};

export function DashboardPageLayout({
  headerContent,
  title = "",
  subtitle,
  showPageHeader = false,
  headerActions,
  kpiContent,
  kpiItems,
  isLoadingKpis,
  children,
  className,
}: DashboardPageLayoutProps) {
  const resolvedTitle = showPageHeader ? title : "";
  const resolvedSubtitle = showPageHeader ? subtitle : "";

  const showDefaultHeader =
    headerContent == null &&
    Boolean(
      headerActions || (showPageHeader && (title || subtitle)),
    );

  const showKpi =
    kpiContent != null ||
    isLoadingKpis === true ||
    (kpiItems != null && kpiItems.length > 0);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {headerContent ?? (showDefaultHeader ? (
        <PageHeader
          title={resolvedTitle}
          subtitle={resolvedSubtitle}
          actions={headerActions}
        />
      ) : null)}

      {kpiContent ?? (showKpi ? <KpiGrid items={kpiItems ?? []} isLoading={isLoadingKpis} /> : null)}

      {children}
    </div>
  );
}
