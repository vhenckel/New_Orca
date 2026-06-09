import { normalizeProductPayload } from "@/modules/product/lib/normalize-product-payload";
import type { ProductDetailView } from "@/modules/product/types/product-detail";
import type {
  BatchEstablishmentProductVariationsPayload,
  EstablishmentProductWithVariants,
  ProductApiPayload,
} from "@/modules/product/types/product-form";
import type {
  EstablishmentProductListItem,
  EstablishmentProductsListPage,
  FetchEstablishmentProductsListParams,
} from "@/modules/product/types/product-list";
import { apiRequest, apiRequestBlob } from "@/shared/api/http-client";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

function buildEstablishmentProductsQuery(params: FetchEstablishmentProductsListParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("totalPerPage", String(params.totalPerPage ?? DEFAULT_PAGE_SIZE));
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  if (params.name?.trim()) search.set("name", params.name.trim());
  if (params.establishmentId) search.set("establishmentId", params.establishmentId);
  return search.toString();
}

export async function fetchEstablishmentProductsPage(
  params: FetchEstablishmentProductsListParams,
): Promise<EstablishmentProductsListPage> {
  return apiRequest<EstablishmentProductsListPage>(
    `/establishment-products?${buildEstablishmentProductsQuery(params)}`,
  );
}

export async function copyEstablishmentProductsTsv(
  params: Omit<FetchEstablishmentProductsListParams, "page" | "totalPerPage">,
): Promise<string> {
  const search = new URLSearchParams();
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  if (params.name?.trim()) search.set("name", params.name.trim());
  if (params.establishmentId) search.set("establishmentId", params.establishmentId);
  const qs = search.toString();
  const blob = await apiRequestBlob(`/establishment-products/copy${qs ? `?${qs}` : ""}`);
  return blob.text();
}

/**
 * GET /establishment-products/:id retorna `id` como product.id (diferente da listagem,
 * onde `id` é o vínculo establishment-product). Normalizamos para o mesmo shape da lista.
 */
type EstablishmentProductDetailResponse = Omit<
  EstablishmentProductListItem,
  "id" | "productId" | "createdAt"
> & {
  id: string;
  productId?: string;
  createdAt?: string;
};

function normalizeEstablishmentProductDetail(
  raw: EstablishmentProductDetailResponse,
  requestedEstablishmentProductId: string,
): EstablishmentProductListItem {
  const establishmentProductId = raw.establishmentProductId ?? requestedEstablishmentProductId;
  const productId = raw.productId ?? raw.id;

  return {
    ...raw,
    id: establishmentProductId,
    establishmentProductId,
    productId,
    createdAt: raw.createdAt ?? "",
  };
}

export async function fetchEstablishmentProductById(
  establishmentProductId: string,
): Promise<EstablishmentProductListItem> {
  const raw = await apiRequest<EstablishmentProductDetailResponse>(
    `/establishment-products/${establishmentProductId}`,
  );
  return normalizeEstablishmentProductDetail(raw, establishmentProductId);
}

export async function fetchProductsWithVariants(params: {
  establishmentId: string;
  name?: string;
}): Promise<EstablishmentProductWithVariants[]> {
  const search = new URLSearchParams({ establishmentId: params.establishmentId });
  if (params.name?.trim()) search.set("name", params.name.trim());
  return apiRequest<EstablishmentProductWithVariants[]>(
    `/establishment-products/with-variants?${search.toString()}`,
  );
}

export async function fetchProductVariants(params: {
  productId: string;
  establishmentId: string;
}): Promise<EstablishmentProductWithVariants> {
  const search = new URLSearchParams({
    productId: params.productId,
    establishmentId: params.establishmentId,
  });
  return apiRequest<EstablishmentProductWithVariants>(
    `/establishment-products/product-variants?${search.toString()}`,
  );
}

export interface CreateEstablishmentProductResponse extends EstablishmentProductListItem {
  establishmentProductId: string;
}

export async function createEstablishmentProduct(
  payload: ProductApiPayload & { establishmentId: string },
): Promise<CreateEstablishmentProductResponse> {
  return apiRequest<CreateEstablishmentProductResponse>("/establishment-products/create", {
    method: "POST",
    body: normalizeProductPayload(payload),
  });
}

export async function updateEstablishmentProduct(
  establishmentProductId: string,
  payload: ProductApiPayload,
): Promise<void> {
  await apiRequest<void>(`/establishment-products/${establishmentProductId}`, {
    method: "PUT",
    body: normalizeProductPayload(payload),
  });
}

export async function batchUpdateVariations(
  payload: BatchEstablishmentProductVariationsPayload,
): Promise<EstablishmentProductWithVariants> {
  return apiRequest<EstablishmentProductWithVariants>("/establishment-products/batch-variations", {
    method: "POST",
    body: payload,
  });
}

export async function patchEstablishmentProductWithBrands(
  establishmentProductId: string,
  body: {
    quoteAnyBrand?: boolean;
    brandIds?: string[];
    newBrandNames?: string[];
  },
): Promise<EstablishmentProductListItem> {
  return apiRequest<EstablishmentProductListItem>(
    `/establishment-products/${establishmentProductId}/with-brands`,
    { method: "PATCH", body },
  );
}

export async function patchQuoteAnyBrand(
  establishmentProductId: string,
  quoteAnyBrand: boolean,
): Promise<void> {
  await apiRequest<void>(`/establishment-products/${establishmentProductId}/quote-any-brand`, {
    method: "PATCH",
    body: { quoteAnyBrand },
  });
}

export async function deleteFromEstablishment(
  establishmentProductId: string,
  establishmentId: string,
): Promise<void> {
  await apiRequest<void>(
    `/establishment-products/${establishmentProductId}/establishment/${establishmentId}`,
    { method: "DELETE" },
  );
}

export interface EstablishmentProductBrandOption {
  id: string;
  name: string;
  gtin?: string;
  status?: string;
}

export async function fetchEstablishmentProductBrands(params: {
  establishmentId: string;
  productId: string;
  establishmentProductId?: string;
}): Promise<EstablishmentProductBrandOption[]> {
  const search = new URLSearchParams();
  if (params.establishmentProductId) {
    search.set("establishmentProductId", params.establishmentProductId);
  }
  const query = search.toString();
  return apiRequest<EstablishmentProductBrandOption[]>(
    `/establishment-products/${params.establishmentId}/product/${params.productId}/brands${query ? `?${query}` : ""}`,
  );
}

export function mapEstablishmentProductToDetailView(
  product: EstablishmentProductListItem,
): ProductDetailView {
  return {
    id: product.establishmentProductId,
    productId: product.productId,
    name: product.name,
    unitType: product.unitType,
    packagingUnit: product.packagingUnit,
    brands: product.brands ?? [],
    segments: (product.segments ?? []).map((s) => ({ id: s.id, name: s.name })),
    establishmentName: product.establishment?.name,
  };
}

export type { EstablishmentProductListItem };
