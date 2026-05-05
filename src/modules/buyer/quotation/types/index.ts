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

export type QuotationLinePriceStatus = "best" | "savings";

export type QuotationDetailLine = {
  productName: string;
  brandsLabel: string;
  quantityLabel: string;
  chosenSupplier: string;
  /** Nome do fornecedor com melhor preço, quando diferente do escolhido. */
  bestSupplierName?: string;
  totalFormatted: string;
  bestTotalFormatted: string;
  diff: "best" | { savingsFormatted: string };
  deliveryLabel: string;
  lineStatus: QuotationLinePriceStatus;
};

export type QuotationSupplierResponse = "answered" | "partial" | "pending";

export type QuotationDetailSupplier = {
  name: string;
  response: QuotationSupplierResponse;
  responseTimeLabel: string;
  totalFormatted: string;
  competitivenessLabel: string;
};

export type QuotationDetail = {
  id: number;
  title: string;
  status: QuotationStatus;
  note: string;
  createdAt: string;
  deadlineAt: string;
  responsesFraction: string;
  responsesSuppliersHint: string;
  responseProgressLabel: string;
  itemCount: number;
  bestTotalFormatted: string;
  gapFormatted: string;
  savingsVsHighestFormatted: string;
  opportunitiesFormatted: string;
  deliveryTerms: string;
  lines: QuotationDetailLine[];
  suppliers: QuotationDetailSupplier[];
  financeChosenFormatted: string;
  financeBestFormatted: string;
  financeWorstFormatted: string;
};
