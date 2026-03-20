import { Ban, Info, Pencil } from "lucide-react";

import type { DebtDetailResponse } from "@/modules/debt-negotiation/types/debt-detail";
import { NegotiationStatusBadge } from "@/modules/debt-negotiation/components/NegotiationStatusBadge";
import { formatCnpj, formatCpf } from "@/modules/debt-negotiation/utils/debt-list-formatters";
import { useI18n } from "@/shared/i18n/useI18n";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

function formatDate(iso: string | null | undefined): string {
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
  infoLabel,
}: {
  label: string;
  value: React.ReactNode;
  withInfo?: boolean;
  infoLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {label}
        {withInfo ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex cursor-help rounded-full p-0.5 hover:bg-muted">
                <Info className="h-3.5 w-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              {infoLabel}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

interface DebtContactCardProps {
  debtData: DebtDetailResponse;
  showBlacklistIcon?: boolean;
}

export function DebtContactCard({
  debtData,
  showBlacklistIcon = false,
}: DebtContactCardProps) {
  const { t } = useI18n();

  const contactDocLabel =
    debtData.contactCnpj && debtData.contactCnpj !== "0"
      ? t("pages.debtNegotiation.debts.detail.cnpj")
      : "CPF";
  const contactDocValue =
    debtData.contactCnpj && debtData.contactCnpj !== "0"
      ? formatCnpj(debtData.contactCnpj)
      : debtData.contactCpf && debtData.contactCpf !== "0"
        ? formatCpf(debtData.contactCpf)
        : "-";

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-0 pt-4">
        <div className="w-full grid grid-cols-[70%_30%] items-start gap-2">
          <Row
            label={t("pages.debtNegotiation.debts.detail.fullName")}
            value={<span className="truncate leading-none">{debtData.contactName}</span>}
          />
          <Row
            label={contactDocLabel}
            value={<span className="font-mono">{contactDocValue}</span>}
          />
        </div>

        {debtData.contactBirthDate ? (
          <Row
            label={t("pages.debtNegotiation.contactDetail.qualification.birthDate")}
            value={formatDate(debtData.contactBirthDate)}
          />
        ) : null}

        {Array.isArray(debtData.contactWhatsapps) && debtData.contactWhatsapps.length > 0 ? (
          <Row
            label={t("pages.debtNegotiation.contactDetail.whatsapps")}
            value={
              <div className="flex flex-col gap-1">
                {debtData.contactWhatsapps.map((w, idx) => (
                  <div key={`${w.originalNumber}-${idx}`} className="flex items-center gap-2">
                    {showBlacklistIcon && w.isInBlacklist ? (
                      <span className="inline-flex shrink-0">
                        <Ban className="h-4 w-4 text-destructive" />
                      </span>
                    ) : null}
                    <span className="text-sm font-medium text-foreground">
                      {w.formattedNumber ?? w.originalNumber}
                    </span>
                  </div>
                ))}
              </div>
            }
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

interface DebtMetricsCardProps {
  debtData: DebtDetailResponse;
  /** Alerta de parcelas (ex.: parcial pago + atraso) — mesmo comportamento do badge na lista. */
  statusShowAlert?: boolean;
  statusAlertMessage?: string;
  canManageStatus?: boolean;
  onManageStatus?: () => void;
  manageStatusPending?: boolean;
}

export function DebtMetricsCard({
  debtData,
  statusShowAlert = false,
  statusAlertMessage = "",
  canManageStatus = false,
  onManageStatus,
  manageStatusPending = false,
}: DebtMetricsCardProps) {
  const { t } = useI18n();
  const negotiatedValue = debtData.negotiatedValue ?? 0;
  const recoveredValue = debtData.recoveredValue ?? 0;
  const progressPercent =
    negotiatedValue > 0
      ? Math.min(100, Math.round((recoveredValue / negotiatedValue) * 100))
      : 0;

  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col gap-3 pt-4">
        <div className="relative grid grid-cols-2 gap-x-8 gap-y-2">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border"
          />

          <div className="flex flex-col gap-0.5 py-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {t("pages.debtNegotiation.debts.detail.status")}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex cursor-help rounded-full p-0.5 hover:bg-muted">
                    <Info className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  {t("pages.debtNegotiation.debts.detail.statusInfo")}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="min-w-0 shrink">
                <NegotiationStatusBadge
                  stageName={debtData.pipelineStageName}
                  showAlert={statusShowAlert}
                  alertMessage={statusAlertMessage}
                />
              </div>
              {canManageStatus && onManageStatus ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={onManageStatus}
                      disabled={manageStatusPending}
                      aria-label={t("pages.debtNegotiation.debts.manageStatus.alter")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {t("pages.debtNegotiation.debts.manageStatus.alter")}
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          </div>
          <Row
            label={t("pages.debtNegotiation.debts.detail.platformRegistrationDate")}
            value={formatDate(debtData.platformRegistrationDate)}
            withInfo
            infoLabel={t("pages.debtNegotiation.debts.detail.additionalInfo")}
          />
          <Row
            label={t("pages.debtNegotiation.debts.detail.originalDebtDate")}
            value={formatDate(debtData.debtRegistrationDate)}
            withInfo
            infoLabel={t("pages.debtNegotiation.debts.detail.additionalInfo")}
          />
          <Row
            label={t("pages.debtNegotiation.debts.detail.debtAgeOnPlatform")}
            value={
              debtData.debtAge === 1
                ? t("pages.debtNegotiation.debts.debtAge.oneDay")
                : t("pages.debtNegotiation.debts.debtAge.days", {
                    count: debtData.debtAge,
                  })
            }
            withInfo
            infoLabel={t("pages.debtNegotiation.debts.detail.additionalInfo")}
          />
          <Row
            label={t("pages.debtNegotiation.debts.col.contractNumber")}
            value={debtData.contractId}
          />
          <div aria-hidden className="min-h-0" />
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
          <div className="flex flex-col gap-0.5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("pages.debtNegotiation.debts.detail.originalDebtAmount")}
            </div>
            <div className="text-sm font-medium text-foreground">
              {formatAmount(debtData.originalDebtAmount)}
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("pages.debtNegotiation.debts.detail.updatedDebtAmount")}
            </div>
            <div className="text-sm font-medium text-foreground">
              {formatAmount(debtData.debtAmount)}
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("pages.debtNegotiation.debts.detail.negotiatedValue")}
            </div>
            <div className="text-sm font-medium text-foreground">
              {formatAmount(debtData.negotiatedValue)}
            </div>
          </div>
        </div>

        <div className="pt-1">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {t("pages.debtNegotiation.debts.detail.recoveredValue")}
            </div>
            <div className="text-sm font-medium text-emerald-600">
              {formatAmount(debtData.recoveredValue)}
            </div>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>0%</span>
            <span className="font-medium text-emerald-600">
              {t("pages.debtNegotiation.debts.detail.recoveredProgress", {
                percent: progressPercent,
              })}
            </span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
