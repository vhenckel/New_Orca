import { parseAsString } from "nuqs";

import type { BudgetFilterStatus, FetchBudgetsParams } from "@/modules/buyer/quotation/types/budget";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

export const budgetListFilterParsers = {
  status: parseAsString.withDefault(""),
  establishmentId: parseAsString.withDefault(""),
};

export const budgetListFilterUrlKeys = {
  status: "bq_status",
  establishmentId: "bq_establishmentId",
} as const;

export interface BudgetListQueryState {
  status: string;
  establishmentId: string;
}

export function toBudgetFetchParams(query: BudgetListQueryState): Omit<FetchBudgetsParams, "page"> {
  const params: Omit<FetchBudgetsParams, "page"> = {
    totalPerPage: DEFAULT_PAGE_SIZE,
  };

  if (query.status) params.status = query.status as BudgetFilterStatus;
  if (query.establishmentId) params.establishmentId = query.establishmentId;

  return params;
}

/** Conta só filtros visíveis/acionados pelo usuário (não escopo implícito de estabelecimento). */
export function countActiveBudgetFilters(
  query: BudgetListQueryState,
  options?: { includeEstablishment?: boolean },
): number {
  let count = 0;
  if (query.status) count += 1;
  if (options?.includeEstablishment && query.establishmentId) count += 1;
  return count;
}

export function clearBudgetListFilters(): BudgetListQueryState {
  return {
    status: "",
    establishmentId: "",
  };
}
