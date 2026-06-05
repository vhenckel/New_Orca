import type { OpenQuotationListItem, FetchOpenQuotationsParams } from "@/modules/supplier/quotation/types/open-quotation";
import type {
  QuotationDetailResponse,
  SendQuotationPayload,
} from "@/modules/supplier/quotation/types/quotation-api";
import { apiRequest } from "@/shared/api/http-client";
import type { PaginatedResponse } from "@/shared/api/pagination";

function buildQuery(params: FetchOpenQuotationsParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("totalPerPage", String(params.totalPerPage ?? 15));
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  if (params.status) search.set("status", params.status);
  return `/quotations?${search.toString()}`;
}

export async function fetchOpenQuotations(
  params: FetchOpenQuotationsParams,
): Promise<PaginatedResponse<OpenQuotationListItem>> {
  return apiRequest<PaginatedResponse<OpenQuotationListItem>>(buildQuery(params));
}

export async function fetchQuotationById(id: string): Promise<QuotationDetailResponse> {
  return apiRequest<QuotationDetailResponse>(`/quotations/${id}`);
}

export async function sendQuotation(
  id: string,
  payload: SendQuotationPayload,
): Promise<void> {
  await apiRequest<void>(`/quotations/${id}/send`, {
    method: "PATCH",
    body: payload,
  });
}
