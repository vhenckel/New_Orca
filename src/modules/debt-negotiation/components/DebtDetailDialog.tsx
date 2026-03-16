import { useState } from "react";
import { Info } from "lucide-react";

import { AddPaymentDialog } from "@/modules/debt-negotiation/components/AddPaymentDialog";
import type { DealItem } from "@/modules/debt-negotiation/types/debt-detail";
import { useDebtDetail } from "@/modules/debt-negotiation/hooks";
import { hasPartialPaidOverdueInstallments } from "@/modules/debt-negotiation/utils/debtInstallmentAlert";
import { useI18n } from "@/shared/i18n/useI18n";
import { StatusBadge } from "@/modules/debt-negotiation/utils/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { cn } from "@/shared/lib/utils";

function formatCnpj(cnpj: string): string {
  if (!cnpj || cnpj === "0") return "-";
  const d = String(cnpj).replace(/\D/g, "");
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function formatDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatAmount(value: number | null): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getInstallmentStatus(item: DealItem): "paid" | "onTime" | "overdue" {
  if (item.paidAt) return "paid";
  const due = new Date(item.dueAt).getTime();
  const now = Date.now();
  return due < now ? "overdue" : "onTime";
}

function Row({
  label,
  value,
  withInfo,
}: {
  label: string;
  value: React.ReactNode;
  withInfo?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {label}
        {withInfo && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex cursor-help rounded-full p-0.5 hover:bg-muted">
                <Info className="h-3.5 w-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              Informação adicional
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

interface DebtDetailDialogProps {
  renegotiationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebtDetailDialog({ renegotiationId, open, onOpenChange }: DebtDetailDialogProps) {
  const { t } = useI18n();
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const { data, isPending, error } = useDebtDetail(open ? renegotiationId : null);
  const showPartialPaidOverdueAlert = hasPartialPaidOverdueInstallments(data?.deal?.items);
  const items = data?.deal?.items ?? [];
  const hasInstallments = items.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={
            hasInstallments
              ? "max-w-4xl min-w-[28rem] sm:min-w-[32rem] max-h-[90vh] overflow-y-auto"
              : "max-w-md"
          }
        >
          <DialogHeader>
            <DialogTitle className="text-left">
              {t("pages.debtNegotiation.debts.detail.title")}
            </DialogTitle>
          </DialogHeader>

          {isPending && (
            <div className="py-8 text-center text-sm text-muted-foreground">Carregando…</div>
          )}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Erro ao carregar detalhes da dívida.
            </div>
          )}
          {data && !error && (
            <div className="space-y-0">
              <Row label={t("pages.debtNegotiation.debts.detail.fullName")} value={data.contactName} />
              <Row
                label={t("pages.debtNegotiation.debts.detail.cnpj")}
                value={data.contactCnpj && data.contactCnpj !== "0" ? formatCnpj(data.contactCnpj) : "-"}
              />
              <Row
                label={t("pages.debtNegotiation.debts.detail.currentStatus")}
                value={
                  <StatusBadge
                    stageName={data.pipelineStageName}
                    showAlert={showPartialPaidOverdueAlert}
                    alertMessage={t("pages.debtNegotiation.debts.detail.partialPaidOverdueAlert")}
                  />
                }
              />
              <Row
                label={t("pages.debtNegotiation.debts.detail.originalDebtDate")}
                value={formatDate(data.debtRegistrationDate)}
                withInfo
              />
              <Row
                label={t("pages.debtNegotiation.debts.detail.originalDebtAmount")}
                value={formatAmount(data.originalDebtAmount)}
              />
              <Row
                label={t("pages.debtNegotiation.debts.detail.platformRegistrationDate")}
                value={formatDate(data.platformRegistrationDate)}
                withInfo
              />
              <Row
                label={t("pages.debtNegotiation.debts.detail.debtAgeOnPlatform")}
                value={data.debtAge === 1 ? "1 dia" : `${data.debtAge} dias`}
                withInfo
              />
              <Row
                label={t("pages.debtNegotiation.debts.detail.updatedDebtAmount")}
                value={formatAmount(data.debtAmount)}
              />
              <Row
                label={t("pages.debtNegotiation.debts.detail.negotiatedValue")}
                value={formatAmount(data.negotiatedValue)}
              />
              <Row
                label={t("pages.debtNegotiation.debts.detail.recoveredValue")}
                value={formatAmount(data.recoveredValue)}
              />
              {hasInstallments && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-medium text-foreground">
                    {t("pages.debtNegotiation.debts.detail.negotiationSummary")}
                  </h3>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("pages.debtNegotiation.debts.informPayment.col.installment")}</TableHead>
                          <TableHead>{t("pages.debtNegotiation.debts.informPayment.col.dueDate")}</TableHead>
                          <TableHead>{t("pages.debtNegotiation.debts.informPayment.col.paymentDate")}</TableHead>
                          <TableHead>{t("pages.debtNegotiation.debts.informPayment.col.amount")}</TableHead>
                          <TableHead>{t("pages.debtNegotiation.debts.informPayment.col.status")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => {
                          const status = getInstallmentStatus(item);
                          const isPaid = status === "paid";
                          const statusKey =
                            status === "paid"
                              ? "pages.debtNegotiation.debts.informPayment.status.paid"
                              : status === "overdue"
                                ? "pages.debtNegotiation.debts.informPayment.status.overdue"
                                : "pages.debtNegotiation.debts.informPayment.status.onTime";
                          const statusClass =
                            status === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                              : status === "overdue"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300";
                          return (
                            <TableRow key={item.id} className={isPaid ? "opacity-90" : undefined}>
                              <TableCell>{item.installment}</TableCell>
                              <TableCell>{formatDate(item.dueAt)}</TableCell>
                              <TableCell>{item.paidAt ? formatDate(item.paidAt) : "-"}</TableCell>
                              <TableCell>{formatAmount(item.amount)}</TableCell>
                              <TableCell>
                                <span
                                  className={cn(
                                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                                    statusClass
                                  )}
                                >
                                  {t(statusKey)}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("pages.debtNegotiation.debts.detail.back")}
            </Button>
            <Button onClick={() => setAddPaymentOpen(true)}>
              {t("pages.debtNegotiation.debts.detail.updateDebt")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {data && renegotiationId && (
        <AddPaymentDialog
          renegotiationId={renegotiationId}
          debtData={data}
          open={addPaymentOpen}
          onOpenChange={setAddPaymentOpen}
        />
      )}
    </>
  );
}
