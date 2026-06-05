import { apiRequest } from "@/shared/api/http-client";
import type { PaginatedResponse } from "@/shared/api/pagination";
import type { BudgetListItem, FetchBudgetsParams } from "@/modules/buyer/quotation/types/budget";
import type {
  BudgetDetail,
  BudgetMutationResponse,
  CreateBudgetPayload,
  SendBudgetResponse,
  UpdateBudgetPayload,
} from "@/modules/buyer/quotation/types/create-budget";
import type {
  BudgetMessageResponse,
  BudgetOrder,
  BudgetSummary,
  BudgetViewProduct,
  BudgetViewSupplier,
  ProductQuotation,
  ProductQuotationSortField,
  ProductQuotationSortOrder,
  SelectQuotationPayload,
} from "@/modules/buyer/quotation/types/view-budget";

function buildBudgetsQuery(params: FetchBudgetsParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("totalPerPage", String(params.totalPerPage ?? 15));
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  if (params.status) search.set("status", params.status);
  if (params.establishmentId) search.set("establishmentId", params.establishmentId);
  return `/budgets?${search.toString()}`;
}

export async function fetchBudgets(
  params: FetchBudgetsParams,
): Promise<PaginatedResponse<BudgetListItem>> {
  return apiRequest<PaginatedResponse<BudgetListItem>>(buildBudgetsQuery(params));
}

export async function deleteBudget(id: string): Promise<void> {
  await apiRequest<void>(`/budgets/${id}`, { method: "DELETE" });
}

export async function fetchBudgetById(id: string): Promise<BudgetDetail> {
  return apiRequest<BudgetDetail>(`/budgets/${id}`);
}

export async function createBudget(payload: CreateBudgetPayload): Promise<BudgetMutationResponse> {
  return apiRequest<BudgetMutationResponse>("/budgets", {
    method: "POST",
    body: payload,
  });
}

export async function updateBudget(
  id: string,
  payload: UpdateBudgetPayload,
): Promise<BudgetMutationResponse> {
  return apiRequest<BudgetMutationResponse>(`/budgets/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function sendBudget(id: string): Promise<SendBudgetResponse> {
  return apiRequest<SendBudgetResponse>(`/budgets/${id}/send`, {
    method: "POST",
    body: {},
  });
}

export async function fetchBudgetSummary(budgetId: string): Promise<BudgetSummary> {
  return apiRequest<BudgetSummary>(`/budgets/${budgetId}/summary`);
}

export async function fetchBudgetProducts(budgetId: string): Promise<BudgetViewProduct[]> {
  return apiRequest<BudgetViewProduct[]>(`/budgets/${budgetId}/products`);
}

export async function fetchBudgetSuppliers(budgetId: string): Promise<BudgetViewSupplier[]> {
  return apiRequest<BudgetViewSupplier[]>(`/budgets/${budgetId}/suppliers`);
}

export async function fetchProductQuotations(
  budgetId: string,
  productId: string,
  params?: { sort?: ProductQuotationSortField; order?: ProductQuotationSortOrder },
): Promise<ProductQuotation[]> {
  const search = new URLSearchParams();
  if (params?.sort) search.set("sort", params.sort);
  if (params?.order) search.set("order", params.order);
  const qs = search.toString();
  const path = `/budgets/${budgetId}/products/${productId}/quotations${qs ? `?${qs}` : ""}`;
  return apiRequest<ProductQuotation[]>(path);
}

export async function finalizeBudget(budgetId: string): Promise<BudgetMessageResponse> {
  return apiRequest<BudgetMessageResponse>(`/budgets/${budgetId}/finalize`, {
    method: "POST",
    body: {},
  });
}

export async function selectProductQuotation(
  budgetId: string,
  productId: string,
  payload: SelectQuotationPayload,
): Promise<BudgetMessageResponse> {
  return apiRequest<BudgetMessageResponse>(
    `/budgets/${budgetId}/products/${productId}/select-quotation`,
    { method: "PUT", body: payload },
  );
}

export async function selectCheapestQuotations(budgetId: string): Promise<BudgetMessageResponse> {
  return apiRequest<BudgetMessageResponse>(
    `/budgets/${budgetId}/products/select-cheapest-quotations`,
    { method: "PUT", body: {} },
  );
}

export async function fetchBudgetOrder(
  budgetId: string,
  supplierId?: string,
): Promise<BudgetOrder> {
  const search = new URLSearchParams();
  if (supplierId) search.set("supplierId", supplierId);
  const qs = search.toString();
  return apiRequest<BudgetOrder>(`/budgets/${budgetId}/order${qs ? `?${qs}` : ""}`);
}
