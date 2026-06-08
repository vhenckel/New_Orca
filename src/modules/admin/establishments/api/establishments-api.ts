import type {
  CreateEstablishmentPayload,
  EstablishmentDetail,
  EstablishmentSearchOption,
  EstablishmentsListPage,
  FetchEstablishmentsListParams,
  UpdateEstablishmentPayload,
} from "@/modules/admin/establishments/types";
import { apiRequest, apiRequestBlob } from "@/shared/api/http-client";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

function appendEstablishmentsFilterParams(
  search: URLSearchParams,
  params: Omit<FetchEstablishmentsListParams, "page">,
): void {
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  if (params.name?.trim()) search.set("name", params.name.trim());
  if (params.responsibleName?.trim()) search.set("responsibleName", params.responsibleName.trim());
  if (params.phone?.trim()) search.set("phone", params.phone.trim());
  if (params.addressState?.trim()) search.set("addressState", params.addressState.trim());
  if (params.addressCity?.trim()) search.set("addressCity", params.addressCity.trim());
  if (params.addressNeighborhood?.trim()) {
    search.set("addressNeighborhood", params.addressNeighborhood.trim());
  }
  if (params.status) search.set("status", params.status);
  if (params.active !== undefined) search.set("active", String(params.active));
  if (params.supplierId) search.set("supplierId", params.supplierId);
  if (params.productId) search.set("productId", params.productId);
}

function buildEstablishmentsQuery(params: FetchEstablishmentsListParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("totalPerPage", String(params.totalPerPage ?? DEFAULT_PAGE_SIZE));
  appendEstablishmentsFilterParams(search, params);
  return search.toString();
}

function buildEstablishmentsCopyQuery(
  params: Omit<FetchEstablishmentsListParams, "page" | "totalPerPage">,
): string {
  const search = new URLSearchParams();
  appendEstablishmentsFilterParams(search, params);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchEstablishmentsPage(
  params: FetchEstablishmentsListParams,
): Promise<EstablishmentsListPage> {
  return apiRequest<EstablishmentsListPage>(`/establishments?${buildEstablishmentsQuery(params)}`);
}

export async function fetchEstablishmentById(id: string): Promise<EstablishmentDetail> {
  return apiRequest<EstablishmentDetail>(`/establishments/${id}`);
}

export async function searchEstablishmentsForParent(name?: string): Promise<EstablishmentSearchOption[]> {
  const query = name?.trim()
    ? `?name=${encodeURIComponent(name.trim())}&totalPerPage=25`
    : "?totalPerPage=25";
  const response = await apiRequest<EstablishmentsListPage>(`/establishments${query}`);
  return (response.data ?? []).map((item) => ({ id: item.id, name: item.name }));
}

export async function copyEstablishmentsTsv(
  params: Omit<FetchEstablishmentsListParams, "page" | "totalPerPage">,
): Promise<string> {
  const blob = await apiRequestBlob(`/establishments/copy${buildEstablishmentsCopyQuery(params)}`);
  return blob.text();
}

export async function createEstablishment(
  payload: CreateEstablishmentPayload,
): Promise<EstablishmentDetail> {
  return apiRequest<EstablishmentDetail>("/establishments", {
    method: "POST",
    body: payload,
  });
}

export async function updateEstablishment(
  id: string,
  payload: UpdateEstablishmentPayload,
): Promise<EstablishmentDetail> {
  return apiRequest<EstablishmentDetail>(`/establishments/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteEstablishment(id: string): Promise<void> {
  await apiRequest<void>(`/establishments/${id}`, { method: "DELETE" });
}

export async function linkEstablishmentSupplier(
  establishmentId: string,
  supplierId: string,
): Promise<void> {
  await apiRequest<void>(`/establishments/${establishmentId}/suppliers`, {
    method: "POST",
    body: { supplierId },
  });
}

export async function unlinkEstablishmentSupplier(
  establishmentId: string,
  supplierId: string,
): Promise<void> {
  await apiRequest<void>(`/establishments/${establishmentId}/suppliers/${supplierId}`, {
    method: "DELETE",
  });
}

export interface AddressByCepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

export async function fetchAddressByCep(cep: string): Promise<AddressByCepResponse> {
  const digits = cep.replace(/\D/g, "");
  return apiRequest<AddressByCepResponse>(`/location/cep/${digits}`);
}

export interface AvailableEstablishmentProduct {
  id: string;
  name: string;
  unitType?: string;
}

export async function fetchAvailableEstablishmentProducts(params: {
  name?: string;
  page?: number;
  totalPerPage?: number;
}): Promise<{ data: AvailableEstablishmentProduct[]; total: number }> {
  const search = new URLSearchParams({
    status: "approved",
    sort: "name",
    page: String(params.page ?? 1),
    totalPerPage: String(params.totalPerPage ?? 25),
  });
  if (params.name?.trim()) search.set("name", params.name.trim());
  return apiRequest<{ data: AvailableEstablishmentProduct[]; total: number }>(
    `/establishment-products/available?${search.toString()}`,
  );
}
