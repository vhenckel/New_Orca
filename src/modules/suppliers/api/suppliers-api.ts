import type {
  CreateSupplierPayload,
  SupplierDetail,
  SupplierSearchResult,
  UpdateSupplierPayload,
} from "@/modules/suppliers/types/supplier-detail";
import type {
  FetchSuppliersListParams,
  SuppliersListPage,
} from "@/modules/suppliers/types/supplier-list";
import { apiRequest, apiRequestBlob } from "@/shared/api/http-client";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

function buildSuppliersQuery(params: FetchSuppliersListParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("totalPerPage", String(params.totalPerPage ?? DEFAULT_PAGE_SIZE));
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  if (params.name?.trim()) search.set("name", params.name.trim());
  if (params.responsibleName?.trim()) search.set("responsibleName", params.responsibleName.trim());
  if (params.phone?.trim()) search.set("phone", params.phone.trim());
  if (params.email?.trim()) search.set("email", params.email.trim());
  if (params.segmentId) search.set("segmentId", params.segmentId);
  if (params.establishmentId) search.set("establishmentId", params.establishmentId);
  if (params.state?.trim()) search.set("state", params.state.trim());
  if (params.city?.trim()) search.set("city", params.city.trim());
  if (params.neighborhood?.trim()) search.set("neighborhood", params.neighborhood.trim());
  return search.toString();
}

export async function fetchSuppliersPage(
  params: FetchSuppliersListParams,
): Promise<SuppliersListPage> {
  return apiRequest<SuppliersListPage>(`/suppliers?${buildSuppliersQuery(params)}`);
}

export async function fetchSupplierById(id: string): Promise<SupplierDetail> {
  return apiRequest<SupplierDetail>(`/suppliers/${id}`);
}

export async function copySuppliersTsv(
  params: Omit<FetchSuppliersListParams, "page">,
): Promise<string> {
  const query = buildSuppliersQuery({ ...params, page: 1 });
  const blob = await apiRequestBlob(`/suppliers/copy?${query}`);
  return blob.text();
}

export async function createSupplier(payload: CreateSupplierPayload): Promise<SupplierDetail> {
  return apiRequest<SupplierDetail>("/suppliers", {
    method: "POST",
    body: {
      ...payload,
      responsible: {
        name: payload.responsible.name.trim(),
        email: payload.responsible.email.trim().toLowerCase(),
      },
      name: payload.name.trim(),
    },
  });
}

export async function updateSupplier(
  id: string,
  payload: UpdateSupplierPayload,
): Promise<SupplierDetail> {
  return apiRequest<SupplierDetail>(`/suppliers/${id}`, {
    method: "PUT",
    body: {
      ...payload,
      responsible: {
        name: payload.responsible.name.trim(),
        email: payload.responsible.email.trim().toLowerCase(),
      },
      name: payload.name.trim(),
    },
  });
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiRequest<void>(`/suppliers/${id}`, { method: "DELETE" });
}

export async function linkSupplierEstablishment(
  supplierId: string,
  establishmentId: string,
): Promise<void> {
  await apiRequest<void>(`/suppliers/${supplierId}/establishments/${establishmentId}`, {
    method: "POST",
  });
}

export async function unlinkSupplierEstablishment(
  supplierId: string,
  establishmentId: string,
): Promise<void> {
  await apiRequest<void>(`/suppliers/${supplierId}/establishments/${establishmentId}`, {
    method: "DELETE",
  });
}

export interface EstablishmentSearchItem {
  id: string;
  name: string;
  address?: { city: string; neighborhood: string };
}

export interface EstablishmentsSearchPage {
  data: EstablishmentSearchItem[];
  total: number;
}

export async function searchSuppliers(q?: string): Promise<SupplierSearchResult[]> {
  const search = new URLSearchParams();
  if (q?.trim()) search.set("q", q.trim());
  const qs = search.toString();
  return apiRequest<SupplierSearchResult[]>(`/suppliers/search${qs ? `?${qs}` : ""}`);
}

export async function searchEstablishments(name?: string): Promise<EstablishmentSearchItem[]> {
  const query = name?.trim() ? `?name=${encodeURIComponent(name.trim())}&totalPerPage=25` : "?totalPerPage=25";
  const response = await apiRequest<EstablishmentsSearchPage>(`/establishments${query}`);
  return response.data ?? [];
}
