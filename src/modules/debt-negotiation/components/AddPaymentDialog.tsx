import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";

import { confirmDeal } from "@/modules/debt-negotiation/services/deal";
import type { DebtDetailResponse } from "@/modules/debt-negotiation/types/debt-detail";
import { StatusBadge } from "@/modules/debt-negotiation/utils/StatusBadge";
import { useI18n } from "@/shared/i18n/useI18n";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

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

export type DebtSettledValue = "no" | "yes";

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
  const [settled, setSettled] = useState<DebtSettledValue>("no");
  const [observation, setObservation] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      confirmDeal(renegotiationId, {
        confirmed: settled === "yes",
        observation: observation.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renegotiation", "debt-detail", renegotiationId] });
      queryClient.invalidateQueries({ queryKey: ["renegotiation", "debt-details"] });
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const handleConfirm = () => {
    mutation.mutate();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSettled("no");
      setObservation("");
      mutation.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">
            {t("pages.debtNegotiation.debts.addPayment.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-0">
          <Row label={t("pages.debtNegotiation.debts.detail.fullName")} value={debtData.contactName} />
          <Row
            label={t("pages.debtNegotiation.debts.detail.cnpj")}
            value={
              debtData.contactCnpj && debtData.contactCnpj !== "0"
                ? formatCnpj(debtData.contactCnpj)
                : "-"
            }
          />
          <Row
            label={t("pages.debtNegotiation.debts.detail.currentStatus")}
            value={<StatusBadge stageName={debtData.pipelineStageName} />}
          />
          <Row
            label={t("pages.debtNegotiation.debts.detail.originalDebtDate")}
            value={formatDate(debtData.debtRegistrationDate)}
            withInfo
          />
          <Row
            label={t("pages.debtNegotiation.debts.detail.originalDebtAmount")}
            value={formatAmount(debtData.originalDebtAmount)}
          />
          <Row
            label={t("pages.debtNegotiation.debts.detail.platformRegistrationDate")}
            value={formatDate(debtData.platformRegistrationDate)}
            withInfo
          />
          <Row
            label={t("pages.debtNegotiation.debts.detail.debtAgeOnPlatform")}
            value={
              debtData.debtAge === 1 ? "1 dia" : `${debtData.debtAge} dias`
            }
            withInfo
          />
          <Row
            label={t("pages.debtNegotiation.debts.detail.updatedDebtAmount")}
            value={formatAmount(debtData.debtAmount)}
          />

          <div className="flex flex-col gap-1.5 py-3">
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

          <div className="flex flex-col gap-1.5 py-2">
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
        </div>

        {mutation.isError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Erro ao confirmar. Tente novamente.
          </div>
        )}

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t("pages.debtNegotiation.debts.detail.back")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "..." : t("pages.debtNegotiation.debts.addPayment.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
