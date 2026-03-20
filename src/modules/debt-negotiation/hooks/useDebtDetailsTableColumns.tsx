import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DollarSign, Eye, MessageCircle } from "lucide-react";

import {
  DEBT_NEGOTIATION_STATUS_BADGE_WIDTH_PX,
  NegotiationStatusBadge,
} from "@/modules/debt-negotiation/components/NegotiationStatusBadge";
import { isRecoveredPipelineStage } from "@/modules/debt-negotiation/constants/pipeline-stages";
import type { DebtDetailsItem } from "@/modules/debt-negotiation/types/debt-details";
import {
  formatCnpj,
  formatDebtAmountString,
} from "@/modules/debt-negotiation/utils/debt-list-formatters";
import type { TranslationKey } from "@/shared/i18n/config";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

export function useDebtDetailsTableColumns(options: {
  t: (key: TranslationKey) => string;
  formatDebtAge: (age: string) => string;
  onDetail: (renegotiationId: string) => void;
  onPayment: (renegotiationId: string) => void;
  onConversation: (contactId: number, contactName: string) => void;
}): ColumnDef<DebtDetailsItem, unknown>[] {
  const { t, formatDebtAge, onDetail, onPayment, onConversation } = options;

  return useMemo(
    () => [
      {
        id: "actions",
        header: t("pages.debtNegotiation.debts.col.actions"),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label={t("pages.debtNegotiation.debts.action.details")}
                    onClick={() => onDetail(r.renegotiationId)}
                  >
                    <Eye className="size-4" />
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
                      disabled={isRecoveredPipelineStage(r.pipelineStageName)}
                      onClick={() => onPayment(r.renegotiationId)}
                    >
                      <DollarSign className="size-4" />
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
                    onClick={() => onConversation(r.contactId, r.contactName)}
                  >
                    <MessageCircle className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {t("pages.debtNegotiation.debts.action.viewConversation")}
                </TooltipContent>
              </Tooltip>
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: "contactName",
        header: t("pages.debtNegotiation.debts.col.nameCpf"),
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-col">
              <button
                type="button"
                className="text-left font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => onDetail(r.renegotiationId)}
              >
                {r.contactName}
              </button>
              <span className="text-xs text-muted-foreground">
                {r.contactCnpj && r.contactCnpj !== "0"
                  ? `CNPJ ${formatCnpj(r.contactCnpj)}`
                  : r.contactCpf && r.contactCpf !== "0"
                    ? `CPF ${r.contactCpf}`
                    : "-"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "contractId",
        header: t("pages.debtNegotiation.debts.col.contractNumber"),
        cell: ({ getValue }) => (
          <span className="font-mono text-muted-foreground">{String(getValue() ?? "")}</span>
        ),
      },
      {
        id: "status",
        size: DEBT_NEGOTIATION_STATUS_BADGE_WIDTH_PX,
        minSize: DEBT_NEGOTIATION_STATUS_BADGE_WIDTH_PX,
        maxSize: DEBT_NEGOTIATION_STATUS_BADGE_WIDTH_PX,
        header: () => (
          <span className="block w-full">
            {t("pages.debtNegotiation.debts.col.status")}
          </span>
        ),
        cell: ({ row }) => (
          <div className="w-full">
            <NegotiationStatusBadge
              stageName={row.original.pipelineStageName}
              showAlert={row.original.isOverdue}
              alertMessage={t("pages.debtNegotiation.debts.detail.partialPaidOverdueAlert")}
            />
          </div>
        ),
      },
      {
        accessorKey: "debtAge",
        header: t("pages.debtNegotiation.debts.col.debtAge"),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{formatDebtAge(String(getValue() ?? ""))}</span>
        ),
      },
      {
        accessorKey: "debtAmount",
        header: () => (
          <span className="block text-left">{t("pages.debtNegotiation.debts.col.debtAmount")}</span>
        ),
        cell: ({ getValue }) => (
          <div className="font-medium tabular-nums">
            {formatDebtAmountString(String(getValue()))}
          </div>
        ),
      },
      {
        accessorKey: "negotiatedValue",
        header: () => (
          <span className="block text-left">
            {t("pages.debtNegotiation.debts.col.negotiatedValue")}
          </span>
        ),
        cell: ({ getValue }) => (
          <div className="text-muted-foreground tabular-nums">
            {formatDebtAmountString(getValue() as string | null)}
          </div>
        ),
      },
      {
        accessorKey: "recoveredValue",
        header: () => (
          <span className="block text-left">
            {t("pages.debtNegotiation.debts.col.recoveredValue")}
          </span>
        ),
        cell: ({ getValue }) => (
          <div className="text-muted-foreground tabular-nums">
            {formatDebtAmountString(getValue() as string | null)}
          </div>
        ),
      },
    ],
    [t, formatDebtAge, onDetail, onPayment, onConversation],
  );
}
