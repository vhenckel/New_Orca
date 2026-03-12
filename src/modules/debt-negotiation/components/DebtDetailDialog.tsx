import { useState } from "react";
import { Info } from "lucide-react";

import { AddPaymentDialog } from "@/modules/debt-negotiation/components/AddPaymentDialog";
import { useDebtDetail } from "@/modules/debt-negotiation/hooks";
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

interface DebtDetailDialogProps {
  renegotiationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebtDetailDialog({ renegotiationId, open, onOpenChange }: DebtDetailDialogProps) {
  const { t } = useI18n();
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const { data, isPending, error } = useDebtDetail(open ? renegotiationId : null);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
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
                value={<StatusBadge stageName={data.pipelineStageName} />}
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
