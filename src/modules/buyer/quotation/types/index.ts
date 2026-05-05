/** Status exibido na lista e no filtro (UI). */
export type QuotationStatus = "open" | "waiting" | "finished";

export type QuotationListItem = {
  id: number;
  title: string;
  status: QuotationStatus;
  createdAt: string;
  deadlineAt: string;
  responses: string;
  total: string;
};

export type BudgetLineItem = {
  productId: string;
  quantity: number;
  anyBrand: boolean;
  brands: string[];
  note: string;
};
