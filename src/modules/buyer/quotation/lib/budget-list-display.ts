import type { BudgetListItem } from "@/modules/buyer/quotation/types/budget";

/** Contagem de respostas exibida na coluna (API: enviadas/total). */
export function formatBudgetResponses(row: BudgetListItem): string {
  return `${row.totalQuotationsSent}/${row.totalQuotations}`;
}

/** Total do orçamento — placeholder até o campo existir na API. */
export function formatBudgetTotal(_row: BudgetListItem): string {
  return "—";
}
