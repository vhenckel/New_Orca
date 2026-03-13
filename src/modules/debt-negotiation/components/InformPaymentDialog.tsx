import { useState, useMemo, useEffect } from "react";
import type { DebtDetailResponse } from "@/modules/debt-negotiation/types/debt-detail";
import type { DealItem } from "@/modules/debt-negotiation/types/debt-detail";
import { useI18n } from "@/shared/i18n/useI18n";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { cn } from "@/shared/lib/utils";

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

interface InformPaymentDialogProps {
  debtData: DebtDetailResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InformPaymentDialog({
  debtData,
  open,
  onOpenChange,
}: InformPaymentDialogProps) {
  const { t } = useI18n();
  const items = useMemo(() => debtData.deal?.items ?? [], [debtData.deal?.items]);
  const unpaidIds = useMemo(() => items.filter((i) => !i.paidAt).map((i) => i.id), [items]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => setSelectedIds(new Set()), [debtData.renegotiationId, items.length]);
  const allUnpaidSelected =
    unpaidIds.length > 0 && selectedIds.size === unpaidIds.length;

  const toggleSelectAll = () => {
    if (allUnpaidSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(unpaidIds));
  };
  const toggleItem = (id: string, isPaid: boolean) => {
    if (isPaid) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl min-w-[28rem] sm:min-w-[32rem] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">
            {t("pages.debtNegotiation.debts.informPayment.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("pages.debtNegotiation.debts.informPayment.instruction")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("pages.debtNegotiation.debts.informPayment.selectedCount").replace(
              "{count}",
              String(selectedIds.size)
            )}
          </p>
          <button
            type="button"
            className="text-sm text-primary underline hover:no-underline"
            onClick={toggleSelectAll}
          >
            {allUnpaidSelected
              ? t("pages.debtNegotiation.debts.informPayment.clearSelection")
              : t("pages.debtNegotiation.debts.informPayment.selectAll")}
          </button>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12" />
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
                      <TableCell>
                        <Checkbox
                          checked={!isPaid && selectedIds.has(item.id)}
                          disabled={isPaid}
                          onCheckedChange={() => toggleItem(item.id, isPaid)}
                        />
                      </TableCell>
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

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("pages.debtNegotiation.debts.informPayment.close")}
          </Button>
          <Button>{t("pages.debtNegotiation.debts.informPayment.processPayment")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
