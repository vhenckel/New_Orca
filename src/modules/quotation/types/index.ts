export type QuotationModuleRouteKey =
  | "dashboard"
  | "quotations"
  | "products"
  | "suppliers"
  | "analytics";

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

export type CatalogProduct = {
  id: string;
  name: string;
  categoryLabel: string;
  category: string;
  unit: string;
  unitPriceCents: number;
  brands: string[];
};

export type BudgetLineItem = {
  productId: string;
  quantity: number;
  anyBrand: boolean;
  brand: string | null;
  note: string;
};
