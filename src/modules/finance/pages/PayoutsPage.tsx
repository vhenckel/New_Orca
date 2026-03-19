import { useCallback, useMemo, useState } from "react";
import { ArrowUpDown, Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

import { DashboardPageLayout } from "@/shared/components/dashboard-layout";
import { DataTable } from "@/shared/components/data-table";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Input } from "@/shared/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { PayoutChangesModal } from "@/modules/finance/components/PayoutChangesModal";
import { PayoutStatusBadge } from "@/modules/finance/components/PayoutStatusBadge";
import { usePayoutList } from "@/modules/finance/hooks/usePayoutList";
import { usePayoutListPaginationQueryState, usePayoutMonthYearQueryState } from "@/modules/finance/lib/payout-query-state";
import { usePayoutPermissions } from "@/modules/finance/hooks/usePayoutPermissions";
import type { PayoutDayDto } from "@/modules/finance/types/payouts";

function SortHeader({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button variant="ghost" size="sm" className="-ml-3" onClick={onClick}>
      {label}
      <ArrowUpDown data-icon="inline-end" className="ml-2" />
    </Button>
  );
}

export function PayoutsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { canViewPage, canViewDetails, canEdit, canViewReconciliation } = usePayoutPermissions();
  const { month, year, setMonthYear } = usePayoutMonthYearQueryState();
  const { page, pageSize, setPagination } = usePayoutListPaginationQueryState();
  const [orderBy, setOrderBy] = useState<"scheduledDate" | "createdAt" | "id">("scheduledDate");
  const [orderDirection, setOrderDirection] = useState<"ASC" | "DESC">("ASC");
  const [modalPayout, setModalPayout] = useState<PayoutDayDto | null>(null);
  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "long",
      }),
    [],
  );
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => {
        const monthNumber = index + 1;
        const monthLabel = monthFormatter.format(new Date(2020, index, 1));
        return {
          value: String(monthNumber),
          label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        };
      }),
    [monthFormatter],
  );

  const { data, isPending, error } = usePayoutList(month, year, {
    orderBy,
    orderDirection,
    page,
    limit: pageSize,
  });

  const toggleSort = useCallback((next: "scheduledDate" | "createdAt" | "id") => {
    if (orderBy !== next) {
      setOrderBy(next);
      setOrderDirection("ASC");
      setPagination({ page: 1 });
      return;
    }
    setOrderDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    setPagination({ page: 1 });
  }, [orderBy, setPagination]);

  const columns = useMemo<ColumnDef<PayoutDayDto>[]>(
    () => [
      {
        id: "actions",
        header: t("pages.finance.payouts.table.actions"),
        cell: ({ row }) => {
          const canOpenModal = canViewDetails || canEdit;
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setModalPayout(row.original)}
                    disabled={!canOpenModal}
                  >
                    <Eye />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {canOpenModal
                  ? t("pages.finance.payouts.table.actions.viewDetails")
                  : t("pages.finance.payouts.table.actions.noPermission")}
              </TooltipContent>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "payoutId",
        header: () => <SortHeader label={t("pages.finance.payouts.table.reconciliation")} onClick={() => toggleSort("id")} />,
        cell: ({ row }) => {
          const canOpenReconciliation = canViewReconciliation;
          const detailSearchParams = new URLSearchParams({
            payoutMonth: String(month),
            payoutYear: String(year),
            payoutPage: String(page),
            payoutPageSize: String(pageSize),
          });
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="link"
                    className="px-0"
                    disabled={!canOpenReconciliation}
                    onClick={() => navigate(`/finance/payouts/${row.original.payoutId}?${detailSearchParams.toString()}`)}
                  >
                    {t("pages.finance.payouts.table.reconciliationId", { id: row.original.payoutId })}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {canOpenReconciliation
                  ? t("pages.finance.payouts.table.reconciliation.view")
                  : t("pages.finance.payouts.table.reconciliation.noPermission")}
              </TooltipContent>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "dateFormatted",
        header: () => <SortHeader label={t("pages.finance.payouts.table.scheduledDate")} onClick={() => toggleSort("scheduledDate")} />,
      },
      { accessorKey: "quantity", header: t("pages.finance.payouts.table.paidContracts") },
      {
        accessorKey: "status",
        header: t("pages.finance.payouts.table.status"),
        cell: ({ row }) => <PayoutStatusBadge status={row.original.status} />,
      },
      { accessorKey: "totalAmountFormatted", header: t("pages.finance.payouts.table.grossAmount") },
      { accessorKey: "feeAmountFormatted", header: t("pages.finance.payouts.table.feeAmount") },
      { accessorKey: "netAmountFormatted", header: t("pages.finance.payouts.table.netAmount") },
    ],
    [canEdit, canViewDetails, canViewReconciliation, navigate, t, toggleSort],
  );

  if (!canViewPage) {
    return (
      <DashboardPageLayout title={t("pages.finance.payouts.title")}>
        <Alert>
          <AlertDescription>{t("pages.finance.payouts.errors.noPermission")}</AlertDescription>
        </Alert>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout
      title={t("pages.finance.payouts.title")}
      subtitle={t("pages.finance.payouts.description")}
      headerActions={
        <div className="flex gap-2">
          <Select value={String(month)} onValueChange={(value) => setMonthYear({ month: Number(value), year })}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder={t("pages.finance.payouts.filters.monthPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {monthOptions.map((monthOption) => (
                  <SelectItem key={monthOption.value} value={monthOption.value}>
                    {monthOption.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            type="number"
            className="w-24"
            value={year}
            onChange={(e) => setMonthYear({ month, year: Number(e.target.value) || year })}
          />
        </div>
      }
      kpiItems={[
        { title: t("pages.finance.payouts.kpi.totalToTransfer"), value: data?.totalToTransferFormatted ?? "-" },
        { title: t("pages.finance.payouts.kpi.pendingToTransfer"), value: data?.pendingToTransferFormatted ?? "-" },
      ]}
      isLoadingKpis={isPending}
    >
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{t("pages.finance.payouts.errors.loadList")}</AlertDescription>
        </Alert>
      ) : null}

      <div className="card-surface overflow-hidden px-0 pb-4 pt-1 sm:px-1">
        <DataTable
          columns={columns}
          result={{ data: data?.days ?? [], total: data?.meta.total ?? 0 }}
          page={page}
          pageSize={pageSize}
          onPaginationChange={setPagination}
          isLoading={isPending}
          getRowId={(row) => String(row.payoutId)}
          emptyMessage={t("pages.finance.payouts.emptyList")}
          hidePagination={(data?.meta.total ?? 0) === 0 && !isPending}
          tableContainerClassName="border-0 rounded-none shadow-none"
        />
      </div>

      <PayoutChangesModal
        open={!!modalPayout}
        payout={modalPayout}
        readOnly={!canEdit}
        onOpenChange={(open) => {
          if (!open) setModalPayout(null);
        }}
      />
    </DashboardPageLayout>
  );
}
