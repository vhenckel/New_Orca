import { useCallback, useMemo, useState } from "react";
import { ArrowUpDown, Download } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useParams } from "react-router-dom";

import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { DataTable } from "@/shared/components/data-table";
import { FilterPanel } from "@/shared/components/filter-panel/FilterPanel";
import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useI18n } from "@/shared/i18n/useI18n";
import { exportPayoutCsv } from "@/modules/finance/services/payouts";
import { usePayoutDetails } from "@/modules/finance/hooks/usePayoutDetails";
import { usePayoutPermissions } from "@/modules/finance/hooks/usePayoutPermissions";
import {
  usePayoutDetailPaginationQueryState,
  usePayoutDetailSearchQueryState,
} from "@/modules/finance/lib/payout-query-state";
import type { PayoutItemDetailDto } from "@/modules/finance/types/payouts";
import { toast } from "@/shared/ui/sonner";

function SortHeader({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="-ml-3" onClick={onClick}>
      {label}
      <ArrowUpDown data-icon="inline-end" className="ml-2" />
    </Button>
  );
}

export function PayoutDetailPage() {
  const { t, locale } = useI18n();
  const { id } = useParams();
  const payoutId = Number(id);
  const { canViewReconciliation, canExport } = usePayoutPermissions();
  const { page, pageSize, setPagination } = usePayoutDetailPaginationQueryState();
  const [search, setSearch] = usePayoutDetailSearchQueryState();
  const [orderBy, setOrderBy] = useState<"id" | "contactName" | "contractId" | "paidAt" | "totalAmount" | "netAmount">("id");
  const [orderDirection, setOrderDirection] = useState<"ASC" | "DESC">("ASC");
  const [exporting, setExporting] = useState(false);
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "BRL",
      }),
    [locale],
  );

  const { data, isPending, error } = usePayoutDetails(Number.isFinite(payoutId) ? payoutId : null, {
    page,
    limit: pageSize,
    orderBy,
    orderDirection,
    keyword: search.trim() || undefined,
  });

  const toggleSort = useCallback((next: typeof orderBy) => {
    if (orderBy !== next) {
      setOrderBy(next);
      setOrderDirection("ASC");
      setPagination({ page: 1 });
      return;
    }
    setOrderDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    setPagination({ page: 1 });
  }, [orderBy, setPagination]);

  const kpiValues = useMemo(() => {
    const totalGross = data?.filteredItemsSummary?.totalAmount ?? data?.totalAmount ?? 0;
    const totalNet = data?.filteredItemsSummary?.netAmount ?? data?.netAmount ?? 0;
    return {
      totalGross: currencyFormatter.format(totalGross),
      totalNet: currencyFormatter.format(totalNet),
    };
  }, [currencyFormatter, data?.filteredItemsSummary?.netAmount, data?.filteredItemsSummary?.totalAmount, data?.netAmount, data?.totalAmount]);
  const paginationLabels = useMemo(
    () => ({
      previous: t("common.pagination.previous"),
      next: t("common.pagination.next"),
      rowsPerPage: locale === "pt-BR" ? "Linhas por página" : "Rows per page",
      range: (from: number, to: number, total: number) => {
        if (locale === "pt-BR") {
          return `${from}–${to} de ${total} ${total === 1 ? "item" : "itens"}`;
        }
        return `${from}-${to} of ${total} ${total === 1 ? "item" : "items"}`;
      },
    }),
    [locale, t],
  );

  const columns = useMemo<ColumnDef<PayoutItemDetailDto>[]>(
    () => [
      {
        accessorKey: "contactName",
        header: () => <SortHeader label={t("pages.finance.payoutDetail.table.contact")} onClick={() => toggleSort("contactName")} />,
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.contactName ?? "-"}</p>
            {row.original.cpfCnpj ? (
              <p className="text-xs text-muted-foreground">CPF/CNPJ: {row.original.cpfCnpj}</p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "contractId",
        header: () => <SortHeader label={t("pages.finance.payoutDetail.table.contractNumber")} onClick={() => toggleSort("contractId")} />,
        cell: ({ row }) => (
          <div>
            <p>{row.original.contractId ?? "-"}</p>
            {row.original.installment != null && row.original.installments != null ? (
              <p className="text-xs text-muted-foreground">
                {t("pages.finance.payoutDetail.table.installment", {
                  installment: row.original.installment,
                  installments: row.original.installments,
                })}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "paidAtFormatted",
        header: () => <SortHeader label={t("pages.finance.payoutDetail.table.paymentDate")} onClick={() => toggleSort("paidAt")} />,
      },
      {
        accessorKey: "totalAmountFormatted",
        header: () => <SortHeader label={t("pages.finance.payoutDetail.table.grossAmount")} onClick={() => toggleSort("totalAmount")} />,
      },
      { accessorKey: "feeAmountFormatted", header: t("pages.finance.payoutDetail.table.feeAmount") },
      {
        accessorKey: "netAmountFormatted",
        header: () => <SortHeader label={t("pages.finance.payoutDetail.table.netAmount")} onClick={() => toggleSort("netAmount")} />,
      },
    ],
    [t, toggleSort],
  );

  async function handleExport() {
    if (!Number.isFinite(payoutId) || !canExport) return;
    try {
      setExporting(true);
      const blob = await exportPayoutCsv(payoutId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payout-${payoutId}-export.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("pages.finance.payoutDetail.export.success"));
    } catch (exportError) {
      toast.error(exportError instanceof Error ? exportError.message : t("pages.finance.payoutDetail.export.error"));
    } finally {
      setExporting(false);
    }
  }

  if (!canViewReconciliation) {
    return (
      <DashboardPageLayout
        showPageHeader
        title={t("modules.finance.routes.payoutDetail.label")}
        subtitle={t("modules.finance.routes.payoutDetail.description")}
      >
        <Alert>
          <AlertDescription>{t("pages.finance.payoutDetail.errors.noPermission")}</AlertDescription>
        </Alert>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("modules.finance.routes.payoutDetail.label")}
      subtitle={t("modules.finance.routes.payoutDetail.description")}
      headerActions={
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button type="button" variant="outline" onClick={handleExport} disabled={exporting || !canExport}>
                <Download data-icon="inline-start" className="mr-2" />
                {t("pages.finance.payoutDetail.export")}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {canExport
              ? t("pages.finance.payoutDetail.export.tooltip")
              : t("pages.finance.payoutDetail.export.noPermission")}
          </TooltipContent>
        </Tooltip>
      }
      kpiItems={[
        {
          title: t("pages.finance.payoutDetail.totalGross"),
          value: kpiValues.totalGross,
        },
        {
          title: t("pages.finance.payoutDetail.totalNet"),
          value: kpiValues.totalNet,
        },
      ]}
      isLoadingKpis={isPending}
    >
      <FilterPanel
        showSearch
        searchValue={search}
        onSearchChange={(value) => {
          void setSearch(value);
          setPagination({ page: 1 });
        }}
        searchPlaceholder={t("pages.finance.payoutDetail.searchPlaceholder")}
        filters={[]}
        appliedFilters={[]}
        onFiltersApply={() => undefined}
        onFiltersClear={() => undefined}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{t("pages.finance.payoutDetail.errors.loadList")}</AlertDescription>
        </Alert>
      ) : null}

      <div className="card-surface overflow-hidden px-0 pb-4 pt-1 sm:px-1">
        <DataTable
          columns={columns}
          result={{ data: data?.items ?? [], total: data?.itemsMeta.total ?? 0 }}
          page={page}
          pageSize={pageSize}
          onPaginationChange={setPagination}
          isLoading={isPending}
          getRowId={(row) => String(row.id)}
          emptyMessage={t("pages.finance.payoutDetail.emptyList")}
          hidePagination={(data?.itemsMeta.total ?? 0) === 0 && !isPending}
          tableContainerClassName="border-0 rounded-none shadow-none"
          paginationLabels={paginationLabels}
        />
      </div>

    </DashboardPageLayout>
  );
}
