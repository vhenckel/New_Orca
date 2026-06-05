import type { EstablishmentProduct } from "@/modules/buyer/quotation/types/create-budget";
import { apiRequest } from "@/shared/api/http-client";
import type { PaginatedResponse } from "@/shared/api/pagination";

const CATALOG_PAGE_SIZE = 100;

type EstablishmentProductsResponse =
  | EstablishmentProduct[]
  | PaginatedResponse<EstablishmentProduct>;

function unwrapProductsPage(response: EstablishmentProductsResponse): {
  data: EstablishmentProduct[];
  total: number;
  pageSize: number;
} {
  if (Array.isArray(response)) {
    return { data: response, total: response.length, pageSize: response.length };
  }
  return {
    data: response.data ?? [],
    total: response.total ?? response.data?.length ?? 0,
    pageSize: response.totalPerPage ?? response.data?.length ?? 0,
  };
}

/** Carrega todo o catálogo (várias páginas se a API paginar). */
export async function fetchEstablishmentProductsAll(
  establishmentId: string,
): Promise<EstablishmentProduct[]> {
  const all: EstablishmentProduct[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (all.length < total) {
    const search = new URLSearchParams({
      establishmentId,
      sort: "name",
      page: String(page),
      totalPerPage: String(CATALOG_PAGE_SIZE),
    });
    const response = await apiRequest<EstablishmentProductsResponse>(
      `/establishment-products/all?${search.toString()}`,
    );
    const { data, total: reportedTotal, pageSize } = unwrapProductsPage(response);
    all.push(...data);
    total = reportedTotal;

    if (data.length === 0 || data.length < pageSize) break;
    page += 1;
    if (page > 50) break;
  }

  return all;
}

export async function fetchEstablishmentProductsForRelation(
  establishmentIdRelation: string,
): Promise<EstablishmentProduct[]> {
  const search = new URLSearchParams({
    establishmentIdRelation,
  });
  return apiRequest<EstablishmentProduct[]>(
    `/establishment-products/all?${search.toString()}`,
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

export async function patchEstablishmentProductWithBrands(
  establishmentProductId: string,
  brandIds: string[],
): Promise<EstablishmentProduct> {
  return apiRequest<EstablishmentProduct>(
    `/establishment-products/${establishmentProductId}/with-brands`,
    {
      method: "PATCH",
      body: { brandIds },
    },
  );
}

export interface AddEstablishmentProductWithBrandsPayload {
  establishmentId: string;
  productId: string;
  quoteAnyBrand?: boolean;
  brandIds?: string[];
  newBrandNames?: string[];
}

export async function addProductWithBrandsToEstablishment(
  payload: AddEstablishmentProductWithBrandsPayload,
): Promise<EstablishmentProduct> {
  return apiRequest<EstablishmentProduct>("/establishment-products/with-brands", {
    method: "POST",
    body: payload,
  });
}

export interface CreateEstablishmentProductPayload {
  name: string;
  establishmentId: string;
  unitType: string;
  segmentIds: string[];
  brands?: { name: string }[];
  packagingUnit?: { unit: string; weight: number } | null;
  ncm?: string;
}

export async function createEstablishmentProduct(
  payload: CreateEstablishmentProductPayload,
): Promise<EstablishmentProduct & { establishmentProductId: string }> {
  return apiRequest<EstablishmentProduct & { establishmentProductId: string }>(
    "/establishment-products/create",
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function createEstablishmentProductBrand(
  establishmentProductId: string,
  name: string,
): Promise<{ id: string; name: string }> {
  return apiRequest<{ id: string; name: string }>(
    `/establishment-products/${establishmentProductId}/brands`,
    {
      method: "POST",
      body: { name },
    },
  );
}
