import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, MessageCircle, Search, DollarSign, Filter, X } from "lucide-react";

import { AddPaymentFlowDialog } from "@/modules/debt-negotiation/components/AddPaymentFlowDialog";
import { ConversationHistoryDialog } from "@/modules/debt-negotiation/components/ConversationHistoryDialog";
import { DebtDetailDialog } from "@/modules/debt-negotiation/components/DebtDetailDialog";
import { useDebtDetails, DEBT_DETAILS_PAGE_SIZE } from "@/modules/debt-negotiation/hooks";
import type { DebtDetailsItem } from "@/modules/debt-negotiation/types/debt-details";
import { StatusBadge } from "@/modules/debt-negotiation/utils/StatusBadge";
import { useI18n } from "@/shared/i18n/useI18n";
import { formatCurrency } from "@/shared/lib/format";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

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
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addPaymentFlowId, setAddPaymentFlowId] = useState<string | null>(null);
  const [addPaymentFlowOpen, setAddPaymentFlowOpen] = useState(false);
  const [conversationContactId, setConversationContactId] = useState<number | null>(null);
  const [conversationContactName, setConversationContactName] = useState<string | null>(null);
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

  const [searchParams, setSearchParams] = useSearchParams();
  const statuses = useMemo(
    () =>
      searchParams
        .getAll("statuses")
        .map((s) => Number(s))
        .filter((n) => Number.isInteger(n)),
    [searchParams]
  );
  const clearStatusFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("statuses");
    setSearchParams(next, { replace: true });
  };

  const { data, error, isPending } = useDebtDetails({
    page,
    statuses: statuses.length > 0 ? statuses : undefined,
    search,
  });

  const totalDebt = data?.totalDebt.currentValue ?? 0;
  const totalCount = data?.totalDebtCount.currentValue ?? 0;
  const list = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / DEBT_DETAILS_PAGE_SIZE));

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
          <p className="mt-1 text-2xl font-bold text-primary">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            {t("pages.debtNegotiation.debts.debtCount")}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{totalCount}</p>
        </div>
      </div>

      {statuses.includes(11) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2.5 py-1 text-sm">
            {t("pages.debtNegotiation.debts.status.confirmacaoPagamento")}
            <button
              type="button"
              aria-label={t("pages.debtNegotiation.debts.clearFilters")}
              className="rounded p-0.5 hover:bg-muted-foreground/20"
              onClick={clearStatusFilter}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("pages.debtNegotiation.debts.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            {t("pages.debtNegotiation.debts.advancedFilters")}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
            {t("pages.debtNegotiation.debts.clearFilters")}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Erro ao carregar dívidas.
        </div>
      )}

      <div className="card-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">{t("pages.debtNegotiation.debts.col.actions")}</TableHead>
              <TableHead>{t("pages.debtNegotiation.debts.col.nameCpf")}</TableHead>
              <TableHead>{t("pages.debtNegotiation.debts.col.contractNumber")}</TableHead>
              <TableHead>{t("pages.debtNegotiation.debts.col.status")}</TableHead>
              <TableHead>{t("pages.debtNegotiation.debts.col.debtAge")}</TableHead>
              <TableHead className="text-right">{t("pages.debtNegotiation.debts.col.debtAmount")}</TableHead>
              <TableHead className="text-right">{t("pages.debtNegotiation.debts.col.negotiatedValue")}</TableHead>
              <TableHead className="text-right">{t("pages.debtNegotiation.debts.col.recoveredValue")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
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
                            aria-label={t("pages.debtNegotiation.debts.action.details")}
                            onClick={() => openDetail(row.renegotiationId)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{t("pages.debtNegotiation.debts.action.details")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <button
                              type="button"
                              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                              aria-label={t("pages.debtNegotiation.debts.action.addPayment")}
                              disabled={
                                row.pipelineStageName.toLowerCase().trim() === "recuperado"
                              }
                              onClick={() => openAddPaymentFlow(row.renegotiationId)}
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{t("pages.debtNegotiation.debts.action.addPayment")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label={t("pages.debtNegotiation.debts.action.viewConversation")}
                            onClick={() => openConversation(row.contactId, row.contactName)}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{t("pages.debtNegotiation.debts.action.viewConversation")}</TooltipContent>
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
                  <TableCell className="font-mono text-muted-foreground">{row.contractId}</TableCell>
                  <TableCell>
                    <StatusBadge
                      stageName={row.pipelineStageName}
                      showAlert={row.isOverdue}
                      alertMessage={t("pages.debtNegotiation.debts.detail.partialPaidOverdueAlert")}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{debtAgeLabel(row.debtAge)}</TableCell>
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
