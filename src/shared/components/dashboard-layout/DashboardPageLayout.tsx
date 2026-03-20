import type { ReactNode } from "react";

import { useI18n } from "@/shared/i18n/useI18n";
import { cn } from "@/shared/lib/utils";

import { KpiGrid } from "./KpiGrid";
import { PageHeader } from "./PageHeader";
import type { BreadcrumbItem, KpiItem, ModulePageBreadcrumb } from "./types";

export type DashboardPageLayoutProps = {
  headerContent?: ReactNode;
  title?: string;
  subtitle?: string;
  /** Se definido, tem prioridade sobre `modulePageBreadcrumb`. */
  breadcrumb?: { items: BreadcrumbItem[] };
  /** Breadcrumb padrão: módulo (link) → título da página. */
  modulePageBreadcrumb?: ModulePageBreadcrumb;
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
  modulePageBreadcrumb,
  onBack,
  backLabel,
  headerActions,
  kpiContent,
  kpiItems,
  isLoadingKpis,
  children,
  className,
}: DashboardPageLayoutProps) {
  const { t } = useI18n();

  const resolvedBreadcrumb =
    breadcrumb ??
    (modulePageBreadcrumb
      ? {
          items: [
            {
              label: t(modulePageBreadcrumb.moduleTitleKey),
              href: modulePageBreadcrumb.moduleHref,
            },
            { label: modulePageBreadcrumb.pageTitle },
          ],
        }
      : undefined);

  const showDefaultHeader =
    headerContent == null &&
    Boolean(
      title ||
        subtitle ||
        (resolvedBreadcrumb?.items?.length ?? 0) > 0 ||
        onBack ||
        headerActions,
    );

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
          breadcrumb={resolvedBreadcrumb}
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
