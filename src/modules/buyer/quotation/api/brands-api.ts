import { apiRequest } from "@/shared/api/http-client";
import type { PaginatedResponse } from "@/shared/api/pagination";

const BRANDS_PAGE_SIZE = 25;

export interface BrandOption {
  id: string;
  name: string;
}

export interface FetchBrandsParams {
  name?: string;
  productId?: string;
  establishmentId?: string;
  status?: string;
  page?: number;
  totalPerPage?: number;
}

type BrandsResponse = BrandOption[] | PaginatedResponse<BrandOption>;

function unwrapBrands(response: BrandsResponse): BrandOption[] {
  if (Array.isArray(response)) return response;
  return response.data ?? [];
}

export async function fetchBrands(params: FetchBrandsParams): Promise<BrandOption[]> {
  const search = new URLSearchParams();
  if (params.name?.trim()) search.set("name", params.name.trim());
  if (params.productId) search.set("productId", params.productId);
  if (params.establishmentId) search.set("establishmentId", params.establishmentId);
  search.set("status", params.status ?? "approved");
  search.set("totalPerPage", String(Math.min(params.totalPerPage ?? BRANDS_PAGE_SIZE, BRANDS_PAGE_SIZE)));
  search.set("page", String(params.page ?? 1));

  const response = await apiRequest<BrandsResponse>(`/brands?${search.toString()}`);
  return unwrapBrands(response);
}
