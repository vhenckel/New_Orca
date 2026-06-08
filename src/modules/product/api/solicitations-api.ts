import type {
  FetchSolicitationsListParams,
  PendingProductDetail,
  SolicitationsListPage,
} from "@/modules/product/types/pending-product";
import { apiRequest, apiRequestBlob } from "@/shared/api/http-client";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

function appendSolicitationsFilterParams(
  search: URLSearchParams,
  params: Omit<FetchSolicitationsListParams, "page">,
): void {
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  if (params.status) search.set("status", params.status);
  if (params.type) search.set("type", params.type);
  if (params.name?.trim()) search.set("name", params.name.trim());
  if (params.establishmentId) search.set("establishmentId", params.establishmentId);
  if (params.segmentId) search.set("segmentId", params.segmentId);
}

function buildSolicitationsQuery(params: FetchSolicitationsListParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("totalPerPage", String(params.totalPerPage ?? DEFAULT_PAGE_SIZE));
  appendSolicitationsFilterParams(search, params);
  return search.toString();
}

function buildSolicitationsCopyQuery(
  params: Omit<FetchSolicitationsListParams, "page" | "totalPerPage">,
): string {
  const search = new URLSearchParams();
  appendSolicitationsFilterParams(search, params);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchSolicitationsPage(
  params: FetchSolicitationsListParams,
): Promise<SolicitationsListPage> {
  return apiRequest<SolicitationsListPage>(`/solicitations?${buildSolicitationsQuery(params)}`);
}

export async function fetchSolicitationById(id: string): Promise<PendingProductDetail> {
  return apiRequest<PendingProductDetail>(`/solicitations/${id}`);
}

export async function copySolicitationsTsv(
  params: Omit<FetchSolicitationsListParams, "page" | "totalPerPage">,
): Promise<string> {
  const blob = await apiRequestBlob(`/solicitations/copy${buildSolicitationsCopyQuery(params)}`);
  return blob.text();
}
