import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  throttle,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";

import { AddPaymentFlowDialog } from "@/modules/debt-negotiation/components/AddPaymentFlowDialog";
import { ConversationHistoryDialog } from "@/modules/debt-negotiation/components/ConversationHistoryDialog";
import { DebtDetailDialog } from "@/modules/debt-negotiation/components/DebtDetailDialog";
import { useDebtDetails } from "@/modules/debt-negotiation/hooks";
import { useDebtDetailsTableColumns } from "@/modules/debt-negotiation/hooks/useDebtDetailsTableColumns";
import { useDebtListDialogs } from "@/modules/debt-negotiation/hooks/useDebtListDialogs";
import { useDebtStatusFilterOptions } from "@/modules/debt-negotiation/hooks/useDebtStatusFilterOptions";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { DataTable } from "@/shared/components/data-table";
import { FilterType } from "@/shared/components/dynamic-filters/types";
import type { AppliedFilter, FilterConfig } from "@/shared/components/dynamic-filters/types";
import { FilterPanel } from "@/shared/components/filter-panel/FilterPanel";
import { useResetPaginationOnDateRangeChange } from "@/shared/hooks/useResetPaginationOnDateRangeChange";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useI18n } from "@/shared/i18n/useI18n";
import { formatCurrency } from "@/shared/lib/format";
import {
  useDebtsPaginationQueryState,
  useDebtNegotiationDateRangeQueryState,
} from "@/shared/lib/nuqs-filters";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertCircle } from "lucide-react";

export function DebtsPage() {
  const { t } = useI18n();
  const { page, pageSize, setPagination } = useDebtsPaginationQueryState();
  const { startDate, endDate } = useDebtNegotiationDateRangeQueryState();
  useResetPaginationOnDateRangeChange(startDate, endDate, setPagination);

  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      history: "replace",
      scroll: false,
      limitUrlUpdates: throttle(200),
    }),
  );
  const debouncedSearch = useDebouncedValue(search, 400);
  const prevSearchRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearchRef.current !== debouncedSearch) {
      prevSearchRef.current = debouncedSearch;
      setPagination({ page: 1 });
    }
  }, [debouncedSearch, setPagination]);

  const dialogs = useDebtListDialogs();

  const [statuses, setStatuses] = useQueryState(
    "statuses",
    parseAsArrayOf(parseAsInteger).withDefault([]),
  );

  const { data, error, isPending } = useDebtDetails({
    startDate,
    endDate,
    page,
    pageSize,
    statuses: statuses.length > 0 ? statuses : undefined,
    search: debouncedSearch,
  });

  const statusOptions = useDebtStatusFilterOptions(data?.availableFilters, t);

  const advancedFilters = useMemo<FilterConfig[]>(
    () => [
      {
        id: "statuses",
        type: FilterType.MULTISELECT,
        label: t("pages.debtNegotiation.debts.col.status"),
        searchable: true,
        options: statusOptions,
      },
      {
        id: "debtAmount",
        type: FilterType.RANGE_CURRENCY,
        label: t("pages.debtNegotiation.debts.col.debtAmount"),
      },
    ],
    [statusOptions, t],
  );

  const appliedAdvancedFilters = useMemo<AppliedFilter[]>(
    () => (statuses.length > 0 ? [{ id: "statuses", values: statuses }] : []),
    [statuses],
  );

  const applyAdvancedFilters = (filters: AppliedFilter[]) => {
    const statusesFilter = filters.find((f) => f.id === "statuses");
    const nextStatuses = Array.isArray(statusesFilter?.values)
      ? statusesFilter!.values
          .map((v) => Number(v))
          .filter((n) => Number.isInteger(n))
      : [];
    void setStatuses(nextStatuses);
    setPagination({ page: 1 });
  };

  const clearAdvancedFilters = () => {
    void setStatuses([]);
    setPagination({ page: 1 });
  };

  const formatDebtAge = useCallback(
    (age: string) => {
      if (!age) return "-";
      const n = Number(age);
      if (!Number.isFinite(n)) return age;
      return n === 1
        ? t("pages.debtNegotiation.debts.debtAge.oneDay")
        : t("pages.debtNegotiation.debts.debtAge.days", { count: n });
    },
    [t],
  );

  const columns = useDebtDetailsTableColumns({
    t,
    formatDebtAge,
    onDetail: dialogs.openDetail,
    onPayment: dialogs.openAddPaymentFlow,
    onConversation: dialogs.openConversation,
  });

  const totalDebt = data?.totalDebt.currentValue ?? 0;
  const totalCount = data?.totalDebtCount.currentValue ?? 0;
  const totalRows = data?.total ?? 0;

  return (
    <DashboardPageLayout
      showPageHeader
      title={t("pages.debtNegotiation.debts.title")}
      subtitle={t("pages.debtNegotiation.debts.description")}
      kpiItems={[
        {
          title: t("pages.debtNegotiation.debts.totalDebt"),
          value: formatCurrency(totalDebt),
          valueVariant: "primary",
        },
        {
          title: t("pages.debtNegotiation.debts.debtCount"),
          value: totalCount,
          isQuantity: true,
        },
      ]}
      isLoadingKpis={isPending}
    >
      <FilterPanel
        showSearch
        searchValue={search}
        onSearchChange={(value) => void setSearch(value)}
        searchPlaceholder={t("pages.debtNegotiation.debts.searchPlaceholder")}
        filters={advancedFilters}
        appliedFilters={appliedAdvancedFilters}
        onFiltersApply={applyAdvancedFilters}
        onFiltersClear={clearAdvancedFilters}
        isLoading={isPending}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{t("pages.debtNegotiation.debts.errors.loadList")}</AlertDescription>
        </Alert>
      )}

      <div className="card-surface overflow-hidden px-0 pb-4 pt-1 sm:px-1">
        <DataTable
          columns={columns}
          result={{ data: data?.data ?? [], total: totalRows }}
          page={page}
          pageSize={pageSize}
          onPaginationChange={setPagination}
          isLoading={isPending}
          getRowId={(row) => row.renegotiationId}
          emptyMessage={t("pages.debtNegotiation.debts.emptyList")}
          hidePagination={totalRows === 0 && !isPending}
          tableContainerClassName="border-0 rounded-none shadow-none"
          paginationLabels={{
            previous: t("common.pagination.previous"),
            next: t("common.pagination.next"),
          }}
        />
      </div>

      <DebtDetailDialog
        renegotiationId={dialogs.dialog?.kind === "detail" ? dialogs.dialog.renegotiationId : null}
        open={dialogs.dialog?.kind === "detail"}
        onOpenChange={dialogs.closeDetail}
      />
      <AddPaymentFlowDialog
        renegotiationId={dialogs.dialog?.kind === "payment" ? dialogs.dialog.renegotiationId : null}
        open={dialogs.dialog?.kind === "payment"}
        onOpenChange={dialogs.closePayment}
      />
      <ConversationHistoryDialog
        contactId={dialogs.dialog?.kind === "conversation" ? dialogs.dialog.contactId : null}
        contactName={
          dialogs.dialog?.kind === "conversation" ? dialogs.dialog.contactName : undefined
        }
        open={dialogs.dialog?.kind === "conversation"}
        onOpenChange={dialogs.closeConversation}
      />
    </DashboardPageLayout>
  );
}
