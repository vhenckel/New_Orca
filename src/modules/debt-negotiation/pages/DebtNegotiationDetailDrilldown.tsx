import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

import { AddPaymentFlowDialog } from "@/modules/debt-negotiation/components/AddPaymentFlowDialog";
import { ConversationHistoryDialog } from "@/modules/debt-negotiation/components/ConversationHistoryDialog";
import { DebtDetailDialog } from "@/modules/debt-negotiation/components/DebtDetailDialog";
import { useRenegotiationBoxes } from "@/modules/debt-negotiation/hooks";
import { useDebtDetailsTableColumns } from "@/modules/debt-negotiation/hooks/useDebtDetailsTableColumns";
import { useDebtListDialogs } from "@/modules/debt-negotiation/hooks/useDebtListDialogs";
import { useDebtStatusFilterOptions } from "@/modules/debt-negotiation/hooks/useDebtStatusFilterOptions";
import { useRenegotiationDrilldownList } from "@/modules/debt-negotiation/hooks/useRenegotiationDrilldownList";
import type { RenegotiationViewListVariant } from "@/modules/debt-negotiation/services/renegotiation-view-list";
import { mapBoxesToDrilldownKpiItems } from "@/modules/debt-negotiation/utils/map-drilldown-kpis";
import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { DataTable } from "@/shared/components/data-table";
import type { AppliedFilter, FilterConfig } from "@/shared/components/dynamic-filters/types";
import { FilterType } from "@/shared/components/dynamic-filters/types";
import { FilterPanel } from "@/shared/components/filter-panel/FilterPanel";
import { useResetPaginationOnDateRangeChange } from "@/shared/hooks/useResetPaginationOnDateRangeChange";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useI18n } from "@/shared/i18n/useI18n";
import {
  debtNegotiationPathWithDateRange,
  useDebtNegotiationDateRangeQueryState,
} from "@/shared/lib/nuqs-filters";
import { Alert, AlertDescription } from "@/shared/ui/alert";

export type DebtNegotiationDetailVariant = RenegotiationViewListVariant;

const TITLE_KEYS: Record<DebtNegotiationDetailVariant, string> = {
  renegotiation: "pages.debtNegotiation.detail.renegotiation.title",
  negotiated: "pages.debtNegotiation.detail.negotiated.title",
  recovered: "pages.debtNegotiation.detail.recovered.title",
};

const SUBTITLE_KEYS: Record<DebtNegotiationDetailVariant, string> = {
  renegotiation: "pages.debtNegotiation.detail.renegotiation.subtitle",
  negotiated: "pages.debtNegotiation.detail.negotiated.subtitle",
  recovered: "pages.debtNegotiation.detail.recovered.subtitle",
};

export interface DebtNegotiationDetailListState {
  page: number;
  pageSize: number;
  setPagination: (u: { page?: number; pageSize?: number }) => void;
  search: string;
  setSearch: (value: string | null) => void;
  statuses: number[];
  setStatuses: (value: number[] | null) => void;
}

export function DebtNegotiationDetailDrilldown({
  variant,
  listState,
}: {
  variant: DebtNegotiationDetailVariant;
  listState: DebtNegotiationDetailListState;
}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { page, pageSize, setPagination, search, setSearch, statuses, setStatuses } = listState;
  const debouncedSearch = useDebouncedValue(search, 400);
  const prevSearchRef = useRef(debouncedSearch);
  useEffect(() => {
    if (prevSearchRef.current !== debouncedSearch) {
      prevSearchRef.current = debouncedSearch;
      setPagination({ page: 1 });
    }
  }, [debouncedSearch, setPagination]);

  const { startDate, endDate } = useDebtNegotiationDateRangeQueryState();
  useResetPaginationOnDateRangeChange(startDate, endDate, setPagination);

  const { data: boxesData, isPending: boxesPending } = useRenegotiationBoxes();
  const { data, error, isPending } = useRenegotiationDrilldownList(variant, {
    startDate,
    endDate,
    page,
    pageSize,
    statuses: statuses.length > 0 ? statuses : undefined,
    search: debouncedSearch,
  });

  const dialogs = useDebtListDialogs();

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

  const kpiItems = useMemo(
    () => mapBoxesToDrilldownKpiItems(boxesData, variant, t),
    [boxesData, variant, t],
  );

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

  const totalRows = data?.total ?? 0;

  return (
    <DashboardPageLayout
      title={t(TITLE_KEYS[variant])}
      subtitle={t(SUBTITLE_KEYS[variant])}
      onBack={() =>
        void navigate(
          debtNegotiationPathWithDateRange("/debt-negotiation", { startDate, endDate }),
        )
      }
      kpiItems={kpiItems}
      isLoadingKpis={boxesPending}
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
