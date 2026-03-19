import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

import { KpiGrid } from "./KpiGrid";
import { PageHeader } from "./PageHeader";
import type { BreadcrumbItem, KpiItem } from "./types";

export type DashboardPageLayoutProps = {
  headerContent?: ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumb?: { items: BreadcrumbItem[] };
  onBack?: () => void;
  backLabel?: string;
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
  breadcrumb,
  onBack,
  backLabel,
  headerActions,
  kpiContent,
  kpiItems,
  isLoadingKpis,
  children,
  className,
}: DashboardPageLayoutProps) {
  const showDefaultHeader =
    headerContent == null &&
    Boolean(title || subtitle || breadcrumb?.items?.length || onBack || headerActions);

  const showKpi =
    kpiContent != null ||
    isLoadingKpis === true ||
    (kpiItems != null && kpiItems.length > 0);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {headerContent ?? (showDefaultHeader ? (
        <PageHeader
          title={title}
          subtitle={subtitle}
          breadcrumb={breadcrumb}
          onBack={onBack}
          backLabel={backLabel}
          actions={headerActions}
        />
      ) : null)}

      {kpiContent ?? (showKpi ? <KpiGrid items={kpiItems ?? []} isLoading={isLoadingKpis} /> : null)}

      {children}
    </div>
  );
}
