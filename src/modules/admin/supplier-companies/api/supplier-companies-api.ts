import type {
  FetchSupplierCompaniesListParams,
  SupplierCompaniesListPage,
  SupplierCompanyDetail,
  SupplierCompanyPayload,
} from "@/modules/admin/supplier-companies/types";
import { apiRequest, apiRequestBlob } from "@/shared/api/http-client";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

function appendSupplierCompaniesFilterParams(
  search: URLSearchParams,
  params: Omit<FetchSupplierCompaniesListParams, "page">,
): void {
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  if (params.name?.trim()) search.set("name", params.name.trim());
}

function buildSupplierCompaniesQuery(params: FetchSupplierCompaniesListParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("totalPerPage", String(params.totalPerPage ?? DEFAULT_PAGE_SIZE));
  appendSupplierCompaniesFilterParams(search, params);
  return search.toString();
}

function buildSupplierCompaniesCopyQuery(
  params: Omit<FetchSupplierCompaniesListParams, "page" | "totalPerPage">,
): string {
  const search = new URLSearchParams();
  appendSupplierCompaniesFilterParams(search, params);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchSupplierCompaniesPage(
  params: FetchSupplierCompaniesListParams,
): Promise<SupplierCompaniesListPage> {
  return apiRequest<SupplierCompaniesListPage>(`/supplier-companies?${buildSupplierCompaniesQuery(params)}`);
}

export async function fetchSupplierCompanyById(id: string): Promise<SupplierCompanyDetail> {
  return apiRequest<SupplierCompanyDetail>(`/supplier-companies/${id}`);
}

export async function copySupplierCompaniesTsv(
  params: Omit<FetchSupplierCompaniesListParams, "page" | "totalPerPage">,
): Promise<string> {
  const blob = await apiRequestBlob(`/supplier-companies/copy${buildSupplierCompaniesCopyQuery(params)}`);
  return blob.text();
}

export async function createSupplierCompany(
  payload: SupplierCompanyPayload,
): Promise<SupplierCompanyDetail> {
  return apiRequest<SupplierCompanyDetail>("/supplier-companies", {
    method: "POST",
    body: payload,
  });
}

export async function updateSupplierCompany(
  id: string,
  payload: SupplierCompanyPayload,
): Promise<SupplierCompanyDetail> {
  return apiRequest<SupplierCompanyDetail>(`/supplier-companies/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteSupplierCompany(id: string): Promise<void> {
  return apiRequest<void>(`/supplier-companies/${id}`, { method: "DELETE" });
}
