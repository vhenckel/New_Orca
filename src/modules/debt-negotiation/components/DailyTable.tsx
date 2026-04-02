import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo } from "react";

import { useRenegotiationDetails } from "@/modules/debt-negotiation/hooks";
import type { RenegotiationDailyRow } from "@/modules/debt-negotiation/types/renegotiation-details";
import {
  formatMonthNavLabel,
  groupDailyRowsByMonth,
} from "@/modules/debt-negotiation/utils/group-daily-rows-by-month";
import { useI18n } from "@/shared/i18n/useI18n";
import { DataTable } from "@/shared/components/data-table";
import { formatCurrencyBRL } from "@/shared/components/dynamic-filters/filters/currency";
import { useResetPaginationOnDateRangeChange } from "@/shared/hooks/useResetPaginationOnDateRangeChange";
import {
  useDailyTableMonthPaginationQueryState,
  useDebtNegotiationDateRangeQueryState,
  useDetailsShowValues,
} from "@/shared/lib/nuqs-filters";

function formatDailyDate(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${day}/${month}`;
}

function mapApiRowToTable(row: RenegotiationDailyRow) {
  return {
    date: formatDailyDate(row.date),
    dateKey: row.date,
    registered: row.registeredDebts,
    collection: row.inCharge,
    cancelled: row.canceled,
    ignored: row.ignored,
    negotiating: row.inNegotiation,
    negotiated: row.negotiated,
    unpaid: row.negotiatedWithoutPayment,
    recovered: row.recovered,
  };
}

export type DailyTableRow = ReturnType<typeof mapApiRowToTable>;

function formatQuantityCell(value: string | number): string {
  if (value === "-" || value === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

function formatValueCell(value: string | number): string {
  if (value === "-" || value === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return formatCurrencyBRL(n);
}

function renderMetricCell(
  raw: string | number,
  mode: "quantity" | "value",
  tone?: "destructive" | "warning" | "success",
) {
  const text = mode === "value" ? formatValueCell(raw) : formatQuantityCell(raw);
  if (!text) {
    return <span className="text-muted-foreground">-</span>;
  }
  const toneClass =
    tone === "destructive"
      ? "font-medium text-destructive"
      : tone === "warning"
        ? "font-medium text-warning"
        : tone === "success"
          ? "font-medium text-success"
          : "";
  return <span className={`font-mono text-sm tabular-nums ${toneClass}`.trim()}>{text}</span>;
}

export function DailyTable() {
  const { locale, t } = useI18n();
  const { startDate, endDate } = useDebtNegotiationDateRangeQueryState();
  const { page, setPagination } = useDailyTableMonthPaginationQueryState();
  useResetPaginationOnDateRangeChange(startDate, endDate, setPagination);

  const [showValues] = useDetailsShowValues();
  const mode = showValues;
  const { data, error, isPending } = useRenegotiationDetails({ showValues });

  const monthGroups = useMemo(
    () => groupDailyRowsByMonth(data?.values ?? []),
    [data?.values],
  );

  const monthCount = monthGroups.length;
  const displayPage = monthCount === 0 ? 1 : Math.min(Math.max(1, page), monthCount);

  useEffect(() => {
    if (monthCount === 0) return;
    if (page > monthCount) {
      setPagination({ page: monthCount });
    }
  }, [monthCount, page, setPagination]);

  const pageRows = useMemo(() => {
    const group = monthGroups[displayPage - 1];
    return group?.rows.map(mapApiRowToTable) ?? [];
  }, [monthGroups, displayPage]);

  const columns = useMemo<ColumnDef<DailyTableRow, unknown>[]>(() => {
    const numMeta = {
      headerClassName: "text-right",
      cellClassName: "text-right",
    } as const;

    return [
      {
        id: "date",
        header: t("dashboard.daily.date"),
        accessorKey: "date",
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">{row.original.date}</span>
        ),
      },
      {
        id: "registered",
        header: t("dashboard.daily.registered"),
        accessorKey: "registered",
        meta: numMeta,
        cell: ({ row }) => renderMetricCell(row.original.registered, mode),
      },
      {
        id: "collection",
        header: t("dashboard.daily.collection"),
        accessorKey: "collection",
        meta: numMeta,
        cell: ({ row }) => renderMetricCell(row.original.collection, mode),
      },
      {
        id: "cancelled",
        header: t("dashboard.daily.cancelled"),
        accessorKey: "cancelled",
        meta: numMeta,
        cell: ({ row }) => renderMetricCell(row.original.cancelled, mode),
      },
      {
        id: "ignored",
        header: t("dashboard.daily.ignored"),
        accessorKey: "ignored",
        meta: numMeta,
        cell: ({ row }) => renderMetricCell(row.original.ignored, mode, "destructive"),
      },
      {
        id: "negotiating",
        header: t("dashboard.daily.negotiating"),
        accessorKey: "negotiating",
        meta: numMeta,
        cell: ({ row }) => renderMetricCell(row.original.negotiating, mode),
      },
      {
        id: "negotiated",
        header: t("dashboard.daily.negotiated"),
        accessorKey: "negotiated",
        meta: numMeta,
        cell: ({ row }) => renderMetricCell(row.original.negotiated, mode),
      },
      {
        id: "unpaid",
        header: t("dashboard.daily.unpaid"),
        accessorKey: "unpaid",
        meta: numMeta,
        cell: ({ row }) => renderMetricCell(row.original.unpaid, mode, "warning"),
      },
      {
        id: "recovered",
        header: t("dashboard.daily.recovered"),
        accessorKey: "recovered",
        meta: numMeta,
        cell: ({ row }) => renderMetricCell(row.original.recovered, mode, "success"),
      },
    ];
  }, [t, mode]);

  const paginationLabels = useMemo(
    () => ({
      previous: t("common.pagination.previous"),
      next: t("common.pagination.next"),
      range: (from: number, _to: number, total: number) => {
        const group = monthGroups[from - 1];
        const month =
          group != null ? formatMonthNavLabel(group.monthKey, locale) : "";
        return t("dashboard.daily.paginationRange", {
          current: from,
          total,
          month,
        });
      },
    }),
    [t, monthGroups, locale],
  );

  return (
    <div className="card-surface animate-fade-in overflow-hidden opacity-0" style={{ animationDelay: "700ms" }}>
      <div className="p-5 pb-0">
        <h3 className="section-title mb-1">{t("dashboard.daily.title")}</h3>
        <p className="section-subtitle mb-4">
          {showValues === "value" ? t("dashboard.daily.subtitleValue") : t("dashboard.daily.subtitle")}
        </p>
      </div>

      {error && (
        <div className="text-destructive px-5 pb-4 text-sm">Erro ao carregar dados diários.</div>
      )}

      <div className="px-1 pb-4 sm:px-2">
        <DataTable<DailyTableRow>
          columns={columns}
          result={{ data: pageRows, total: monthCount }}
          page={displayPage}
          pageSize={1}
          onPaginationChange={setPagination}
          isLoading={isPending}
          getRowId={(row) => row.dateKey}
          emptyMessage={t("dashboard.daily.emptyPeriod")}
          hidePagination={monthCount <= 1}
          tableContainerClassName="border-0 rounded-none shadow-none"
          paginationLabels={paginationLabels}
          hidePageSizeSelect
        />
      </div>
    </div>
  );
}
