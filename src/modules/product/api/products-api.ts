import type {
  AdminProductListItem,
  FetchProductsListParams,
  ProductsListPage,
} from "@/modules/product/types/product-list";
import type { ProductDetailView } from "@/modules/product/types/product-detail";
import type { PendingProductModerationPayload } from "@/modules/product/types/pending-product";
import { normalizeProductPayload } from "@/modules/product/lib/normalize-product-payload";
import type { ProductApiPayload } from "@/modules/product/types/product-form";
import { apiRequest, apiRequestBlob } from "@/shared/api/http-client";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

export interface PlatformProductDetailResponse {
  id: string;
  name: string;
  unitType: string;
  packagingUnit?: { unit: string; weight: number } | null;
  brands: Array<{ id: string; name: string; gtin?: string; status?: string }>;
  segments: Array<{ id: string; name: string } | string>;
  ncm?: string | null;
  status?: string;
  establishmentId?: string | null;
}

export interface CreateProductPayload {
  name: string;
  brands: Array<{ id?: string; name: string; gtin?: string }>;
  unitType: string;
  packagingUnit?: { unit: string; weight: number };
  segmentIds: string[];
  ncm?: string;
}

function appendProductsFilterParams(
  search: URLSearchParams,
  params: Omit<FetchProductsListParams, "page">,
): void {
  search.set("status", params.status ?? "approved");
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  if (params.name?.trim()) search.set("name", params.name.trim());
  if (params.brand?.trim()) search.set("brand", params.brand.trim());
  if (params.segmentId) search.set("segmentId", params.segmentId);
  if (params.weight != null && !Number.isNaN(params.weight)) {
    search.set("weight", String(params.weight));
  }
}

function buildProductsQuery(params: FetchProductsListParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("totalPerPage", String(params.totalPerPage ?? DEFAULT_PAGE_SIZE));
  appendProductsFilterParams(search, params);
  return search.toString();
}

function buildProductsCopyQuery(params: Omit<FetchProductsListParams, "page">): string {
  const search = new URLSearchParams();
  appendProductsFilterParams(search, params);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchProductsPage(
  params: FetchProductsListParams,
): Promise<ProductsListPage> {
  return apiRequest<ProductsListPage>(`/products?${buildProductsQuery(params)}`);
}

export async function fetchProductById(id: string): Promise<PlatformProductDetailResponse> {
  return apiRequest<PlatformProductDetailResponse>(`/products/${id}`);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiRequest<void>(`/products/${id}`, { method: "DELETE" });
}

export async function createProduct(
  payload: ProductApiPayload,
): Promise<PlatformProductDetailResponse> {
  return apiRequest<PlatformProductDetailResponse>("/products", {
    method: "POST",
    body: normalizeProductPayload(payload),
  });
}

export async function updateProduct(
  id: string,
  payload: ProductApiPayload,
): Promise<PlatformProductDetailResponse> {
  return apiRequest<PlatformProductDetailResponse>(`/products/${id}`, {
    method: "PUT",
    body: normalizeProductPayload(payload),
  });
}

export async function patchProductBrands(
  id: string,
  brands: Array<{ name: string; gtin?: string }>,
): Promise<void> {
  await apiRequest<void>(`/products/${id}/brands`, {
    method: "PATCH",
    body: { brands },
  });
}

export async function copyProductsTsv(
  params: Omit<FetchProductsListParams, "page" | "totalPerPage">,
): Promise<string> {
  const blob = await apiRequestBlob(`/products/copy${buildProductsCopyQuery(params)}`);
  return blob.text();
}

export async function updatePendingProduct(
  id: string,
  payload: PendingProductModerationPayload,
): Promise<void> {
  await apiRequest<void>(`/products/${id}/pending`, {
    method: "PUT",
    body: normalizeProductPayload(payload),
  });
}

export async function approveProduct(
  id: string,
  payload?: PendingProductModerationPayload,
): Promise<void> {
  await apiRequest<void>(`/products/${id}/approve`, {
    method: "PUT",
    body: payload ? normalizeProductPayload(payload) : undefined,
  });
}

export async function rejectProduct(
  id: string,
  payload?: PendingProductModerationPayload,
): Promise<void> {
  await apiRequest<void>(`/products/${id}/reject`, {
    method: "PUT",
    body: payload ? normalizeProductPayload(payload) : undefined,
  });
}

export async function approveProductBrand(
  productId: string,
  brandId: string,
  payload?: PendingProductModerationPayload,
): Promise<void> {
  await apiRequest<void>(`/products/${productId}/brands/${brandId}/approve`, {
    method: "PUT",
    body: payload ? normalizeProductPayload(payload) : undefined,
  });
}

export async function rejectProductBrand(
  productId: string,
  brandId: string,
  payload?: PendingProductModerationPayload,
): Promise<void> {
  await apiRequest<void>(`/products/${productId}/brands/${brandId}/reject`, {
    method: "PUT",
    body: payload ? normalizeProductPayload(payload) : undefined,
  });
}

export function mapPlatformProductToDetailView(
  product: PlatformProductDetailResponse,
): ProductDetailView {
  const segments = (product.segments ?? []).map((s) =>
    typeof s === "string" ? { name: s } : { id: s.id, name: s.name },
  );
  return {
    id: product.id,
    productId: product.id,
    name: product.name,
    unitType: product.unitType,
    packagingUnit: product.packagingUnit,
    brands: product.brands ?? [],
    segments,
  };
}

export type { AdminProductListItem };
