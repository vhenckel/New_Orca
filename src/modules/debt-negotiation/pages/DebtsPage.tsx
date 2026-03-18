import { useMemo, useState } from "react";
import { Eye, MessageCircle, DollarSign, X } from "lucide-react";
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
import { FilterPanel } from "@/shared/components/filter-panel/FilterPanel";
import {
  useDebtDetails,
  DEBT_DETAILS_PAGE_SIZE,
} from "@/modules/debt-negotiation/hooks";
import { FilterType } from "@/shared/components/dynamic-filters/types";
import type {
  AppliedFilter,
  FilterConfig,
} from "@/shared/components/dynamic-filters/types";
import type { DebtDetailsItem } from "@/modules/debt-negotiation/types/debt-details";
import { StatusBadge } from "@/modules/debt-negotiation/utils/StatusBadge";
import { useI18n } from "@/shared/i18n/useI18n";
import { formatCurrency } from "@/shared/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { Button } from "@/shared/ui/button";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

function formatDebtAmount(value: string | null): string {
  if (value == null || value === "") return "-";
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatCnpj(cnpj: string): string {
  if (!cnpj || cnpj === "0") return "-";
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function debtAgeLabel(age: string): string {
  if (!age) return "-";
  const n = Number(age);
  if (!Number.isFinite(n)) return age;
  return n === 1 ? "1 dia" : `${age} dias`;
}

export function DebtsPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({
      history: "replace",
      scroll: false,
      limitUrlUpdates: throttle(200),
    }),
  );
  const debouncedSearch = useDebouncedValue(search, 400);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addPaymentFlowId, setAddPaymentFlowId] = useState<string | null>(null);
  const [addPaymentFlowOpen, setAddPaymentFlowOpen] = useState(false);
  const [conversationContactId, setConversationContactId] = useState<
    number | null
  >(null);
  const [conversationContactName, setConversationContactName] = useState<
    string | null
  >(null);
  const [conversationOpen, setConversationOpen] = useState(false);

  const openDetail = (renegotiationId: string) => {
    setDetailId(renegotiationId);
    setDetailOpen(true);
  };
  const openAddPaymentFlow = (renegotiationId: string) => {
    setAddPaymentFlowId(renegotiationId);
    setAddPaymentFlowOpen(true);
  };
  const openConversation = (contactId: number, contactName: string) => {
    setConversationContactId(contactId);
    setConversationContactName(contactName);
    setConversationOpen(true);
  };
  const closeDetail = () => {
    setDetailOpen(false);
    setDetailId(null);
  };

  const [statuses, setStatuses] = useQueryState(
    "statuses",
    parseAsArrayOf(parseAsInteger).withDefault([]),
  );

  const { data, error, isPending } = useDebtDetails({
    page,
    statuses: statuses.length > 0 ? statuses : undefined,
    search: debouncedSearch,
  });

  const statusOptions = useMemo(() => {
    const fromApi = data?.availableFilters?.find(
      (f) => f.id === "statuses" || f.id === "status",
    );
    if (fromApi?.options?.length) return fromApi.options;
    // Fallback: keep UX working if API doesn't return availableFilters yet
    return [
      {
        value: 11,
        label: t("pages.debtNegotiation.debts.status.confirmacaoPagamento"),
      },
    ];
  }, [data?.availableFilters, t]);

  const statusLabelByValue = useMemo(() => {
    const map = new Map<number, string>();
    for (const opt of statusOptions) map.set(Number(opt.value), opt.label);
    return map;
  }, [statusOptions]);

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
  };

  const clearAdvancedFilters = () => {
    void setStatuses([]);
  };

  const totalDebt = data?.totalDebt.currentValue ?? 0;
  const totalCount = data?.totalDebtCount.currentValue ?? 0;
  const list = data?.data ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.total ?? 0) / DEBT_DETAILS_PAGE_SIZE),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {t("pages.debtNegotiation.debts.pageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("pages.debtNegotiation.debts.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            {t("pages.debtNegotiation.debts.totalDebt")}
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {formatCurrency(totalDebt)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            {t("pages.debtNegotiation.debts.debtCount")}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {totalCount}
          </p>
        </div>
      </div>

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
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Erro ao carregar dívidas.
        </div>
      )}

      <div className="card-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                {t("pages.debtNegotiation.debts.col.actions")}
              </TableHead>
              <TableHead>
                {t("pages.debtNegotiation.debts.col.nameCpf")}
              </TableHead>
              <TableHead>
                {t("pages.debtNegotiation.debts.col.contractNumber")}
              </TableHead>
              <TableHead>
                {t("pages.debtNegotiation.debts.col.status")}
              </TableHead>
              <TableHead>
                {t("pages.debtNegotiation.debts.col.debtAge")}
              </TableHead>
              <TableHead className="text-right">
                {t("pages.debtNegotiation.debts.col.debtAmount")}
              </TableHead>
              <TableHead className="text-right">
                {t("pages.debtNegotiation.debts.col.negotiatedValue")}
              </TableHead>
              <TableHead className="text-right">
                {t("pages.debtNegotiation.debts.col.recoveredValue")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  Carregando…
                </TableCell>
              </TableRow>
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  Nenhuma dívida encontrada.
                </TableCell>
              </TableRow>
            ) : (
              list.map((row: DebtDetailsItem) => (
                <TableRow key={row.renegotiationId}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label={t(
                              "pages.debtNegotiation.debts.action.details",
                            )}
                            onClick={() => openDetail(row.renegotiationId)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t("pages.debtNegotiation.debts.action.details")}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <button
                              type="button"
                              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                              aria-label={t(
                                "pages.debtNegotiation.debts.action.addPayment",
                              )}
                              disabled={
                                row.pipelineStageName.toLowerCase().trim() ===
                                "recuperado"
                              }
                              onClick={() =>
                                openAddPaymentFlow(row.renegotiationId)
                              }
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t("pages.debtNegotiation.debts.action.addPayment")}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label={t(
                              "pages.debtNegotiation.debts.action.viewConversation",
                            )}
                            onClick={() =>
                              openConversation(row.contactId, row.contactName)
                            }
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t(
                            "pages.debtNegotiation.debts.action.viewConversation",
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        className="text-left font-medium text-primary underline-offset-4 hover:underline"
                        onClick={() => openDetail(row.renegotiationId)}
                      >
                        {row.contactName}
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {row.contactCnpj && row.contactCnpj !== "0"
                          ? `CNPJ ${formatCnpj(row.contactCnpj)}`
                          : row.contactCpf && row.contactCpf !== "0"
                            ? `CPF ${row.contactCpf}`
                            : "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {row.contractId}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      stageName={row.pipelineStageName}
                      showAlert={row.isOverdue}
                      alertMessage={t(
                        "pages.debtNegotiation.debts.detail.partialPaidOverdueAlert",
                      )}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {debtAgeLabel(row.debtAge)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatDebtAmount(row.debtAmount)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {formatDebtAmount(row.negotiatedValue)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {formatDebtAmount(row.recoveredValue)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("common.pagination.pageOf")
              .replace("{page}", String(page))
              .replace("{total}", String(totalPages))}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("common.pagination.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("common.pagination.next")}
            </Button>
          </div>
        </div>
      )}

      <DebtDetailDialog
        renegotiationId={detailId}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setDetailId(null);
        }}
      />
      <AddPaymentFlowDialog
        renegotiationId={addPaymentFlowId}
        open={addPaymentFlowOpen}
        onOpenChange={(open) => {
          setAddPaymentFlowOpen(open);
          if (!open) setAddPaymentFlowId(null);
        }}
      />
      <ConversationHistoryDialog
        contactId={conversationContactId}
        contactName={conversationContactName ?? undefined}
        open={conversationOpen}
        onOpenChange={(open) => {
          setConversationOpen(open);
          if (!open) {
            setConversationContactId(null);
            setConversationContactName(null);
          }
        }}
      />
    </div>
  );
}
