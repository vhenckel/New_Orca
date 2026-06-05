import { apiRequest } from "@/shared/api/http-client";
import type { PaginatedResponse } from "@/shared/api/pagination";

/** Limite máximo aceito pelo backend (`PaginatedRequestDto`). */
const PRODUCTS_PAGE_SIZE = 25;

export interface PlatformProductBrand {
  id: string;
  name: string;
}

export interface PlatformProductSegment {
  id: string;
  name: string;
}

export interface PlatformProductPackaging {
  unit: string;
  weight: number;
}

export interface PlatformProduct {
  id: string;
  name: string;
  unitType: string;
  packagingUnit?: PlatformProductPackaging | null;
  brands: PlatformProductBrand[];
  segments: PlatformProductSegment[];
}

export interface PlatformProductDetail extends PlatformProduct {
  ncm?: string | null;
}

export async function fetchProductById(id: string): Promise<PlatformProductDetail> {
  return apiRequest<PlatformProductDetail>(`/products/${id}`);
}

export interface FetchApprovedProductsParams {
  name?: string;
  status?: string;
  totalPerPage?: number;
  page?: number;
}

type ProductsResponse = PlatformProduct[] | PaginatedResponse<PlatformProduct>;

function unwrapProducts(response: ProductsResponse): PlatformProduct[] {
  if (Array.isArray(response)) return response;
  return response.data ?? [];
}

function buildProductsQuery(params: FetchApprovedProductsParams, page: number): string {
  const perPage = Math.min(params.totalPerPage ?? PRODUCTS_PAGE_SIZE, PRODUCTS_PAGE_SIZE);
  const search = new URLSearchParams();
  if (params.name?.trim()) search.set("name", params.name.trim());
  search.set("status", params.status ?? "approved");
  search.set("totalPerPage", String(perPage));
  search.set("page", String(page));
  search.set("sort", "name");
  search.set("order", "ASC");
  return search.toString();
}

/** Busca produtos aprovados da plataforma (pagina até esgotar o total reportado). */
export async function fetchApprovedProducts(
  params: FetchApprovedProductsParams = {},
): Promise<PlatformProduct[]> {
  const all: PlatformProduct[] = [];
  let page = params.page ?? 1;
  let total = Number.POSITIVE_INFINITY;

  while (all.length < total) {
    const response = await apiRequest<ProductsResponse>(
      `/products?${buildProductsQuery(params, page)}`,
    );

    if (Array.isArray(response)) {
      return response;
    }

    const data = response.data ?? [];
    all.push(...data);
    total = response.total ?? data.length;

    if (data.length === 0 || data.length < (response.totalPerPage ?? PRODUCTS_PAGE_SIZE)) {
      break;
    }
    page += 1;
    if (page > 40) break;
  }

  return all;
}
