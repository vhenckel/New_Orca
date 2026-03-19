import type { RenegotiationViewListVariant } from "@/modules/debt-negotiation/services/renegotiation-view-list";
import type { RenegotiationBoxesResponse } from "@/modules/debt-negotiation/types/renegotiation-boxes";
import type { KpiItem } from "@/shared/components/dashboard-layout/types";
import type { TranslationKey } from "@/shared/i18n/config";
import { formatCurrency } from "@/shared/lib/format";

export function mapBoxesToDrilldownKpiItems(
  boxesData: RenegotiationBoxesResponse | undefined,
  variant: RenegotiationViewListVariant,
  t: (key: TranslationKey) => string,
): KpiItem[] {
  if (!boxesData) return [];
  if (variant === "renegotiation") {
    return [
      {
        title: t("pages.debtNegotiation.debts.totalDebt"),
        value: formatCurrency(boxesData.totalDebt.currentValue),
        valueVariant: "primary" as const,
      },
      {
        title: t("pages.debtNegotiation.debts.debtCount"),
        value: boxesData.totalDebtCount.currentValue,
        isQuantity: true,
      },
    ];
  }
  if (variant === "negotiated") {
    return [
      {
        title: t("dashboard.kpis.totalNegotiated"),
        value: formatCurrency(boxesData.totalNegotiated.currentValue),
        valueVariant: "primary" as const,
      },
      {
        title: t("dashboard.kpis.activeNegotiations"),
        value: boxesData.totalNegotiatedCount.currentValue,
        isQuantity: true,
      },
    ];
  }
  return [
    {
      title: t("dashboard.kpis.totalRecovered"),
      value: formatCurrency(boxesData.totalRecoveredNegotiated.currentValue),
      valueVariant: "primary" as const,
    },
    {
      title: t("dashboard.kpis.closedAgreements"),
      value: boxesData.totalRecoveredCount.currentValue,
      isQuantity: true,
    },
  ];
}
