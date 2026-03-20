import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  confirmDeal,
  type ConfirmDealItemPayload,
} from "@/modules/debt-negotiation/services/deal";
import {
  simulateDeal,
  type DealSimulationParams,
  type DealSimulationResponse,
} from "@/modules/debt-negotiation/services/deal-simulation";
import {
  DebtContactCard,
  DebtMetricsCard,
} from "@/modules/debt-negotiation/components/DebtOverviewCards";
import type { DebtDetailResponse } from "@/modules/debt-negotiation/types/debt-detail";
import { hasPartialPaidOverdueInstallments } from "@/modules/debt-negotiation/utils/debtInstallmentAlert";
import { NegotiationStatusBadge } from "@/modules/debt-negotiation/components/NegotiationStatusBadge";
import { useI18n } from "@/shared/i18n/useI18n";
import { SidePanelLayout } from "@/shared/ui/side-panel-layout";
import {
  SidePanel,
  SidePanelContent,
  SidePanelTitle,
} from "@/shared/ui/side-panel";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Input } from "@/shared/ui/input";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { toast } from "@/shared/ui/sonner";
import { cn } from "@/shared/lib/utils";

export type DebtSettledValue = "no" | "yes";

type PaymentTypeValue = "cash" | "installment";

function parseCurrencyBr(input: string): number {
  return parseFloat(input.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
}

function formatCurrencyBr(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function normalizeDueAt(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface AddPaymentDialogProps {
  renegotiationId: string;
  debtData: DebtDetailResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddPaymentDialog({
  renegotiationId,
  debtData,
  open,
  onOpenChange,
  onSuccess,
}: AddPaymentDialogProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const toastId = `confirm-deal-${renegotiationId}`;
  const [settled, setSettled] = useState<DebtSettledValue>("no");
  const [observation, setObservation] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentTypeValue>("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [nextInstallmentDate, setNextInstallmentDate] = useState("");
  const [installmentQuantity, setInstallmentQuantity] = useState<number | undefined>(
    undefined,
  );
  const [simulationData, setSimulationData] = useState<DealSimulationResponse | null>(null);
  const [simulationError, setSimulationError] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationRequestId = useRef(0);

  const showPartialPaidOverdueAlert = hasPartialPaidOverdueInstallments(debtData.deal?.items);

  useEffect(() => {
    if (settled === "yes" && paymentType === "cash") {
      setPaidAmount(formatCurrencyBr(debtData.debtAmount));
    }
  }, [settled, paymentType, debtData.debtAmount]);

  useEffect(() => {
    if (settled !== "yes" || paymentType !== "installment") {
      setIsSimulating(false);
      return;
    }
    const numeric = parseCurrencyBr(downPayment);
    if (!numeric || numeric <= 0) {
      setSimulationData(null);
      setInstallmentQuantity(undefined);
      setSimulationError(false);
      setIsSimulating(false);
      return;
    }
    const timer = window.setTimeout(() => {
      const params: DealSimulationParams = {
        entryAmount: numeric,
        nextDueDate: nextInstallmentDate || null,
      };
      const reqId = ++simulationRequestId.current;
      setIsSimulating(true);
      void (async () => {
        try {
          const data = await simulateDeal(renegotiationId, params);
          if (simulationRequestId.current !== reqId) return;
          setSimulationData(data);
          setSimulationError(false);
        } catch {
          if (simulationRequestId.current !== reqId) return;
          setSimulationData(null);
          setSimulationError(true);
        } finally {
          if (simulationRequestId.current === reqId) {
            setIsSimulating(false);
          }
        }
      })();
    }, 500);
    return () => window.clearTimeout(timer);
  }, [downPayment, nextInstallmentDate, settled, paymentType, renegotiationId]);

  useEffect(() => {
    if (!simulationData?.options?.length) {
      setInstallmentQuantity(undefined);
      return;
    }
    setInstallmentQuantity((prev) => {
      if (prev != null && simulationData.options.some((o) => o.quantity === prev)) return prev;
      return simulationData.options[0]?.quantity;
    });
  }, [simulationData]);

  const selectedOption = useMemo(() => {
    if (!simulationData?.options || installmentQuantity == null) return null;
    return simulationData.options.find((o) => o.quantity === installmentQuantity) ?? null;
  }, [simulationData, installmentQuantity]);

  const installmentRows = useMemo(() => {
    if (!selectedOption) return [];
    return selectedOption.items.map((item) => ({
      installment: item.installment,
      dueLabel: formatDisplayDate(item.dueAt),
      amountLabel: formatCurrencyBr(item.amount),
    }));
  }, [selectedOption]);

  const isFormValid = (): boolean => {
    if (settled === "no") return true;
    if (!paymentDate) return false;
    if (paymentType === "cash") return Boolean(paidAmount.trim());
    if (!downPayment.trim() || installmentQuantity == null) return false;
    if (isSimulating) return false;
    return Boolean(selectedOption?.items?.length);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const confirmed = settled === "yes";
      const trimmedObservation = observation.trim();

      if (!confirmed) {
        return confirmDeal(renegotiationId, {
          confirmed: false,
          observation: trimmedObservation,
        });
      }

      if (paymentType === "cash") {
        const debtValue = debtData.debtAmount;
        const paidAmountValue = parseCurrencyBr(paidAmount) || debtValue;
        return confirmDeal(renegotiationId, {
          confirmed: true,
          observation: trimmedObservation,
          deal: {
            items: [
              {
                installment: 1,
                amount: paidAmountValue,
                dueAt: paymentDate,
                paidAt: paymentDate,
              },
            ],
          },
        });
      }

      if (!selectedOption) {
        throw new Error("missing_simulation");
      }

      const dealItems: ConfirmDealItemPayload[] = selectedOption.items.map((item) => {
        const isFirst = item.installment === 1;
        return {
          installment: item.installment,
          amount: item.amount,
          dueAt: normalizeDueAt(item.dueAt),
          paidAt: isFirst && paymentDate ? paymentDate : null,
        };
      });

      return confirmDeal(renegotiationId, {
        confirmed: true,
        observation: trimmedObservation,
        deal: { items: dealItems },
      });
    },
    onMutate: () => {
      toast.loading(t("pages.debtNegotiation.debts.addPayment.toast.sending"), {
        id: toastId,
      });
    },
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || t("pages.debtNegotiation.debts.addPayment.toast.error"), {
          id: toastId,
        });
        return;
      }

      toast.success(t("pages.debtNegotiation.debts.addPayment.toast.success"), { id: toastId });
      queryClient.invalidateQueries({
        queryKey: ["renegotiation", "debt-detail", renegotiationId],
      });
      queryClient.invalidateQueries({ queryKey: ["renegotiation", "debt-details"] });
      queryClient.invalidateQueries({
        queryKey: ["renegotiation", "pending-payment-confirmations"],
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => {
      if (err instanceof Error && err.message === "missing_simulation") {
        toast.error(t("pages.debtNegotiation.debts.addPayment.validationFillFields"), {
          id: toastId,
        });
        return;
      }
      toast.error(
        err instanceof Error ? err.message : t("pages.debtNegotiation.debts.addPayment.toast.error"),
        { id: toastId },
      );
    },
  });

  const handleConfirm = () => {
    if (settled === "yes") {
      if (!paymentDate.trim()) {
        toast.error(t("pages.debtNegotiation.debts.addPayment.validationPaymentDate"));
        return;
      }
      if (paymentType === "cash") {
        if (!paidAmount.trim()) {
          toast.error(t("pages.debtNegotiation.debts.addPayment.validationFillFields"));
          return;
        }
      } else {
        if (!downPayment.trim() || installmentQuantity == null || !selectedOption) {
          toast.error(t("pages.debtNegotiation.debts.addPayment.validationFillFields"));
          return;
        }
      }
    }
    mutation.mutate();
  };

  const handlePaymentTypeChange = (v: PaymentTypeValue) => {
    simulationRequestId.current += 1;
    setIsSimulating(false);
    setPaymentType(v);
    if (v === "cash") {
      setDownPayment("");
      setNextInstallmentDate("");
      setInstallmentQuantity(undefined);
      setSimulationData(null);
      setSimulationError(false);
      setPaidAmount(formatCurrencyBr(debtData.debtAmount));
    } else {
      setPaidAmount("");
    }
  };

  const resetForm = () => {
    setSettled("no");
    setObservation("");
    setPaymentDate("");
    setPaymentType("cash");
    setPaidAmount("");
    setDownPayment("");
    setNextInstallmentDate("");
    setInstallmentQuantity(undefined);
    setSimulationData(null);
    setSimulationError(false);
    mutation.reset();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const confirmLabel =
    settled === "yes"
      ? t("pages.debtNegotiation.debts.addPayment.confirmPayment")
      : t("pages.debtNegotiation.debts.addPayment.confirm");

  const confirmPending = mutation.isPending;

  return (
    <SidePanel open={open} onOpenChange={handleOpenChange}>
      <SidePanelContent size="md">
        <SidePanelLayout
          header={
            <SidePanelTitle className="text-base">
              {t("pages.debtNegotiation.debts.addPayment.title")}
            </SidePanelTitle>
          }
          footerLeft={
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {t("pages.debtNegotiation.debts.detail.back")}
            </Button>
          }
          footerRight={
            <Button onClick={handleConfirm} disabled={confirmPending || !isFormValid()}>
              {confirmPending ? "..." : confirmLabel}
            </Button>
          }
        >
          <div className="flex flex-col gap-3">
            <div className="w-full flex items-center justify-end">
              <NegotiationStatusBadge
                stageName={debtData.pipelineStageName}
                showAlert={showPartialPaidOverdueAlert}
                alertMessage={t("pages.debtNegotiation.debts.detail.partialPaidOverdueAlert")}
              />
            </div>

            <DebtContactCard debtData={debtData} />
            <DebtMetricsCard debtData={debtData} />

            <Card className="shadow-sm">
              <CardContent className="space-y-4 pt-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm text-muted-foreground">
                    {t("pages.debtNegotiation.debts.addPayment.debtSettled")}
                  </Label>
                  <Select
                    value={settled}
                    onValueChange={(v) => setSettled(v as DebtSettledValue)}
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

                {settled === "yes" ? (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-medium">
                        {t("pages.debtNegotiation.debts.addPayment.paymentDate")}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className={cn(!paymentDate && "border-destructive/60")}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-sm text-muted-foreground">
                        {t("pages.debtNegotiation.debts.addPayment.paymentType")}
                      </Label>
                      <RadioGroup
                        value={paymentType}
                        onValueChange={(v) => handlePaymentTypeChange(v as PaymentTypeValue)}
                        className="flex flex-col gap-2 sm:flex-row sm:gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="cash" id="pay-cash" />
                          <Label htmlFor="pay-cash" className="font-normal cursor-pointer">
                            {t("pages.debtNegotiation.debts.addPayment.paymentTypeCash")}
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="installment" id="pay-installment" />
                          <Label htmlFor="pay-installment" className="font-normal cursor-pointer">
                            {t("pages.debtNegotiation.debts.addPayment.paymentTypeInstallment")}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {paymentType === "cash" ? (
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-sm text-muted-foreground">
                          {t("pages.debtNegotiation.debts.addPayment.paidAmount")}
                        </Label>
                        <Input
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                          placeholder="R$ 0,00"
                          inputMode="decimal"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-sm font-medium">
                            {t("pages.debtNegotiation.debts.addPayment.downPayment")}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={downPayment}
                            onChange={(e) => setDownPayment(e.target.value)}
                            placeholder="R$ 0,00"
                            inputMode="decimal"
                            className={cn(!downPayment.trim() && "border-destructive/60")}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <Label className="text-sm text-muted-foreground">
                            {t("pages.debtNegotiation.debts.addPayment.nextInstallmentDue")}
                          </Label>
                          <Input
                            type="date"
                            value={nextInstallmentDate}
                            onChange={(e) => setNextInstallmentDate(e.target.value)}
                          />
                        </div>

                        {isSimulating && (
                          <p className="text-xs text-muted-foreground">
                            {t("pages.debtNegotiation.debts.addPayment.simulating")}
                          </p>
                        )}

                        {simulationError && (
                          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {t("pages.debtNegotiation.debts.addPayment.simulationError")}
                          </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                          <Label className="text-sm text-muted-foreground">
                            {t("pages.debtNegotiation.debts.addPayment.installmentCount")}
                          </Label>
                          <Select
                            value={
                              installmentQuantity != null ? String(installmentQuantity) : ""
                            }
                            onValueChange={(v) => setInstallmentQuantity(Number(v))}
                            disabled={!simulationData?.options?.length}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  "pages.debtNegotiation.debts.addPayment.selectInstallmentsPlaceholder",
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {(simulationData?.options ?? []).map((opt) => (
                                <SelectItem key={opt.quantity} value={String(opt.quantity)}>
                                  {t("pages.debtNegotiation.debts.addPayment.installmentOption", {
                                    count: opt.quantity,
                                    amount: formatCurrencyBr(opt.amount),
                                  })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {installmentRows.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              {t("pages.debtNegotiation.debts.addPayment.installmentSummary")}
                            </Label>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-20">
                                    {t("pages.debtNegotiation.debts.addPayment.col.installment")}
                                  </TableHead>
                                  <TableHead>
                                    {t("pages.debtNegotiation.debts.addPayment.col.dueDate")}
                                  </TableHead>
                                  <TableHead className="text-right">
                                    {t("pages.debtNegotiation.debts.addPayment.col.amount")}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {installmentRows.map((row) => (
                                  <TableRow key={row.installment}>
                                    <TableCell>{row.installment}</TableCell>
                                    <TableCell>{row.dueLabel}</TableCell>
                                    <TableCell className="text-right">{row.amountLabel}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="flex flex-col gap-1.5 border-t pt-4">
                  <Label className="text-sm text-muted-foreground">
                    {t("pages.debtNegotiation.debts.addPayment.observations")}
                  </Label>
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

            {mutation.isError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Erro ao confirmar. Tente novamente.
              </div>
            )}
          </div>
        </SidePanelLayout>
      </SidePanelContent>
    </SidePanel>
  );
}
