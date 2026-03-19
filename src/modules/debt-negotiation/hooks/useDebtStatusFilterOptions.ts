import { useMemo } from "react";

import { PAYMENT_CONFIRMATION_FILTER_STAGE_ID } from "@/modules/debt-negotiation/constants/pipeline-stages";
import type { TranslationKey } from "@/shared/i18n/config";

type AvailableFilters = { id: string; options?: { value: number; label: string }[] }[];

export function useDebtStatusFilterOptions(
  availableFilters: AvailableFilters | undefined,
  t: (key: TranslationKey) => string,
) {
  return useMemo(() => {
    const fromApi = availableFilters?.find((f) => f.id === "statuses" || f.id === "status");
    if (fromApi?.options?.length) return fromApi.options;
    return [
      {
        value: PAYMENT_CONFIRMATION_FILTER_STAGE_ID,
        label: t("pages.debtNegotiation.debts.status.confirmacaoPagamento"),
      },
    ];
  }, [availableFilters, t]);
}
