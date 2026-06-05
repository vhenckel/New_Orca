export type BudgetStatus = "saved" | "open" | "finished" | "canceled";

export type BudgetSortField = "establishment" | "createdAt";

export type SortOrder = "ASC" | "DESC";

export const BUDGET_FILTER_STATUS_OPTIONS = ["saved", "open", "finished"] as const;

export type BudgetFilterStatus = (typeof BUDGET_FILTER_STATUS_OPTIONS)[number];

export interface BudgetEstablishment {
  id: string;
  name: string;
}

export interface BudgetListItem {
  id: string;
  establishment: BudgetEstablishment;
  deadline: string;
  status: BudgetStatus;
  createdAt: string;
  totalQuotations: number;
  totalQuotationsSent: number;
}

export interface FetchBudgetsParams {
  page: number;
  totalPerPage?: number;
  sort?: BudgetSortField;
  order?: SortOrder;
  status?: BudgetFilterStatus;
  establishmentId?: string;
}
