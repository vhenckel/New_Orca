import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmInstallmentPayment } from "@/modules/debt-negotiation/services/deal";
import type { DebtDetailResponse } from "@/modules/debt-negotiation/types/debt-detail";
import type { DealItem } from "@/modules/debt-negotiation/types/debt-detail";
import { useI18n } from "@/shared/i18n/useI18n";
import { SidePanelLayout } from "@/shared/ui/side-panel-layout";
import {
  SidePanel,
  SidePanelContent,
  SidePanelTitle,
} from "@/shared/ui/side-panel";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { cn } from "@/shared/lib/utils";
import { toast } from "@/shared/ui/sonner";

type SettledChoice = "yes" | "no";

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
  const queryClient = useQueryClient();
  const items = useMemo(() => debtData.deal?.items ?? [], [debtData.deal?.items]);
  const unpaidIds = useMemo(() => items.filter((i) => !i.paidAt).map((i) => i.id), [items]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [settled, setSettled] = useState<SettledChoice>("no");
  const [paymentDate, setPaymentDate] = useState("");
  const [observation, setObservation] = useState("");
  const toastId = `confirm-deal-${debtData.renegotiationId}`;

  useEffect(() => setSelectedIds(new Set()), [debtData.renegotiationId, items.length]);

  useEffect(() => {
    if (!open) {
      setStep("select");
      setSettled("no");
      setPaymentDate("");
      setObservation("");
    }
  }, [open]);

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

  const selectedItems = useMemo(
    () => items.filter((i) => selectedIds.has(i.id)),
    [items, selectedIds],
  );

  const totalAmount = useMemo(
    () =>
      selectedItems.reduce((acc, i) => {
        if (typeof i.amount === "number" && Number.isFinite(i.amount)) {
          return acc + i.amount;
        }
        return acc;
      }, 0),
    [selectedItems],
  );

  const amountPerInstallmentDisplay = useMemo(() => {
    if (selectedItems.length === 0) return "-";
    const amounts = selectedItems
      .map((i) => i.amount)
      .filter((a): a is number => typeof a === "number" && Number.isFinite(a));
    if (amounts.length === 0) return "-";
    const unique = new Set(amounts);
    if (unique.size !== 1) return "-";
    return formatAmount(amounts[0] ?? null);
  }, [selectedItems]);

  const mutation = useMutation({
    mutationFn: () => {
      const confirmed = settled === "yes";
      const trimmed = observation.trim();

      if (confirmed && !paymentDate) {
        return Promise.reject(new Error("paymentDateRequired"));
      }

      const payloadItems = Array.from(selectedIds)
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id))
        .map((id) => ({ id }));

      return confirmInstallmentPayment(debtData.renegotiationId, {
        confirmed,
        observation: trimmed,
        ...(confirmed && paymentDate ? { paidAt: paymentDate } : {}),
        items: payloadItems,
      });
    },
    onMutate: () => {
      toast.loading(t("pages.debtNegotiation.debts.addPayment.toast.sending"), {
        id: toastId,
      });
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(
          result.message || t("pages.debtNegotiation.debts.addPayment.toast.error"),
          { id: toastId },
        );
        return;
      }

      toast.success(t("pages.debtNegotiation.debts.addPayment.toast.success"), {
        id: toastId,
      });
      void queryClient.invalidateQueries({
        queryKey: ["renegotiation", "debt-detail", debtData.renegotiationId],
      });
      void queryClient.invalidateQueries({ queryKey: ["renegotiation", "debt-details"] });
      void queryClient.invalidateQueries({
        queryKey: ["renegotiation", "pending-payment-confirmations"],
      });
      onOpenChange(false);
    },
    onError: (err) => {
      if (err instanceof Error && err.message === "paymentDateRequired") {
        toast.error(
          t("pages.debtNegotiation.debts.informPayment.toast.paymentDateRequired"),
          { id: toastId },
        );
        return;
      }
      toast.error(
        err instanceof Error
          ? err.message
          : t("pages.debtNegotiation.debts.addPayment.toast.error"),
        { id: toastId },
      );
    },
  });

  const goToConfirm = () => {
    if (selectedIds.size === 0) {
      toast.error(t("pages.debtNegotiation.debts.informPayment.toast.selectOne"), {
        id: toastId,
      });
      return;
    }
    setStep("confirm");
  };

  const handleConfirmPayment = () => {
    if (selectedIds.size === 0) {
      toast.error(t("pages.debtNegotiation.debts.informPayment.toast.selectOne"), {
        id: toastId,
      });
      return;
    }
    mutation.mutate();
  };

  const headerTitle =
    step === "confirm"
      ? t("pages.debtNegotiation.debts.informPayment.confirmTitle")
      : t("pages.debtNegotiation.debts.informPayment.title");

  const footerLeft =
    step === "confirm" ? (
      <Button
        variant="outline"
        onClick={() => setStep("select")}
        disabled={mutation.isPending}
      >
        {t("common.back")}
      </Button>
    ) : (
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        {t("pages.debtNegotiation.debts.informPayment.close")}
      </Button>
    );

  const footerRight =
    step === "confirm" ? (
      <Button onClick={handleConfirmPayment} disabled={mutation.isPending}>
        {mutation.isPending ? "..." : t("pages.debtNegotiation.debts.addPayment.confirm")}
      </Button>
    ) : (
      <Button onClick={goToConfirm}>
        {t("pages.debtNegotiation.debts.informPayment.continue")}
      </Button>
    );

  return (
    <SidePanel open={open} onOpenChange={onOpenChange}>
      <SidePanelContent size="xl">
        <SidePanelLayout
          header={
            <SidePanelTitle className="text-base">{headerTitle}</SidePanelTitle>
          }
          footerLeft={footerLeft}
          footerRight={footerRight}
        >
          {step === "select" && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("pages.debtNegotiation.debts.informPayment.instruction")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("pages.debtNegotiation.debts.informPayment.selectedCount").replace(
                    "{count}",
                    String(selectedIds.size),
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
                <div className="card-surface overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12" />
                        <TableHead>
                          {t("pages.debtNegotiation.debts.informPayment.col.installment")}
                        </TableHead>
                        <TableHead>
                          {t("pages.debtNegotiation.debts.informPayment.col.dueDate")}
                        </TableHead>
                        <TableHead>
                          {t("pages.debtNegotiation.debts.informPayment.col.paymentDate")}
                        </TableHead>
                        <TableHead>
                          {t("pages.debtNegotiation.debts.informPayment.col.amount")}
                        </TableHead>
                        <TableHead>
                          {t("pages.debtNegotiation.debts.informPayment.col.status")}
                        </TableHead>
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
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : status === "overdue"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-sky-50 text-sky-700 border-sky-200";
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
                              <Badge variant="outline" className={cn("text-xs", statusClass)}>
                                {t(statusKey)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "confirm" && (
            <div className="flex flex-col gap-4">
              <Card className="border bg-muted/30 shadow-sm">
                <CardContent className="space-y-3 pt-4">
                  <div className="text-sm font-medium">
                    {t("pages.debtNegotiation.debts.informPayment.selectedInstallmentsHeading")}
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {selectedItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap justify-between gap-2 border-b border-border/60 pb-2 last:border-0 last:pb-0"
                      >
                        <span>
                          {t("pages.debtNegotiation.debts.informPayment.col.installment")}{" "}
                          {item.installment}
                        </span>
                        <span>
                          {t("pages.debtNegotiation.debts.informPayment.col.dueDate")}:{" "}
                          {formatDate(item.dueAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {t("pages.debtNegotiation.debts.informPayment.amountPerInstallment")}
                    </span>
                    <span className="font-medium tabular-nums">{amountPerInstallmentDisplay}</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 border-t pt-3 text-sm">
                    <span className="font-medium">
                      {t("pages.debtNegotiation.debts.informPayment.totalToPay")}
                    </span>
                    <span className="font-semibold tabular-nums">{formatAmount(totalAmount)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="space-y-4 pt-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>{t("pages.debtNegotiation.debts.addPayment.debtSettled")}</Label>
                    <Select
                      value={settled}
                      onValueChange={(v) => setSettled(v as SettledChoice)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">
                          {t("pages.debtNegotiation.debts.addPayment.debtSettledNo")}
                        </SelectItem>
                        <SelectItem value="yes">
                          {t("pages.debtNegotiation.debts.addPayment.debtSettledYes")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {settled === "yes" && (
                    <div className="flex flex-col gap-1.5">
                      <Label>
                        {t("pages.debtNegotiation.debts.informPayment.paymentDateLabel")}
                        <span className="text-destructive"> *</span>
                      </Label>
                      <input
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("pages.debtNegotiation.debts.informPayment.paymentDateRequiredHint")}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <Label>{t("pages.debtNegotiation.debts.addPayment.observations")}</Label>
                    <Textarea
                      placeholder={t("pages.debtNegotiation.debts.addPayment.observationsPlaceholder")}
                      value={observation}
                      onChange={(e) => setObservation(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </SidePanelLayout>
      </SidePanelContent>
    </SidePanel>
  );
}
