import { parseAsString } from "nuqs";

import {
  ESTABLISHMENT_PRODUCTS_LIST_DEFAULT_SORT,
  PRODUCTS_LIST_DEFAULT_PARAMS,
  type EstablishmentProductSortField,
  type FetchEstablishmentProductsListParams,
  type FetchProductsListParams,
  type ProductSortField,
  type SortOrder,
} from "@/modules/product/types/product-list";

export const productListFilterParsers = {
  name: parseAsString.withDefault(""),
  brand: parseAsString.withDefault(""),
  weight: parseAsString.withDefault(""),
  segmentId: parseAsString.withDefault(""),
  establishmentId: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  order: parseAsString.withDefault(""),
};

export const productListFilterUrlKeys = {
  name: "p_name",
  brand: "p_brand",
  weight: "p_weight",
  segmentId: "p_segmentId",
  establishmentId: "p_establishmentId",
  sort: "p_sort",
  order: "p_order",
} as const;

export type ProductListQueryState = {
  name: string;
  brand: string;
  weight: string;
  segmentId: string;
  establishmentId: string;
  sort: string;
  order: string;
};

/** @deprecated Use ProductListQueryState */
export type AdminProductListQueryState = Pick<
  ProductListQueryState,
  "name" | "brand" | "weight" | "segmentId" | "sort" | "order"
>;

/** @deprecated Use ProductListQueryState */
export type EstablishmentProductListQueryState = Pick<
  ProductListQueryState,
  "name" | "establishmentId" | "sort" | "order"
>;

export function toAdminProductsFetchParams(
  query: Pick<ProductListQueryState, "name" | "brand" | "weight" | "segmentId" | "sort" | "order">,
): Omit<FetchProductsListParams, "page"> {
  const params: Omit<FetchProductsListParams, "page"> = {
    totalPerPage: PRODUCTS_LIST_DEFAULT_PARAMS.totalPerPage,
    status: PRODUCTS_LIST_DEFAULT_PARAMS.status,
  };

  if (query.name.trim()) params.name = query.name.trim();
  if (query.brand.trim()) params.brand = query.brand.trim();
  if (query.segmentId) params.segmentId = query.segmentId;
  const weight = parseFloat(query.weight.replace(",", "."));
  if (query.weight.trim() && !Number.isNaN(weight)) params.weight = weight;
  if (query.sort) params.sort = query.sort as ProductSortField;
  if (query.order) params.order = query.order as SortOrder;

  return params;
}

export function toEstablishmentProductsFetchParams(
  query: Pick<ProductListQueryState, "name" | "establishmentId" | "sort" | "order">,
): Omit<FetchEstablishmentProductsListParams, "page"> {
  const params: Omit<FetchEstablishmentProductsListParams, "page"> = {
    totalPerPage: PRODUCTS_LIST_DEFAULT_PARAMS.totalPerPage,
    sort: ESTABLISHMENT_PRODUCTS_LIST_DEFAULT_SORT.sort,
    order: ESTABLISHMENT_PRODUCTS_LIST_DEFAULT_SORT.order,
  };

  if (query.name.trim()) params.name = query.name.trim();
  if (query.establishmentId) params.establishmentId = query.establishmentId;
  if (query.sort) params.sort = query.sort as EstablishmentProductSortField;
  if (query.order) params.order = query.order as SortOrder;

  return params;
}

export function countActiveAdminProductFilters(
  query: Pick<ProductListQueryState, "brand" | "weight" | "segmentId">,
): number {
  let count = 0;
  if (query.brand.trim()) count += 1;
  if (query.weight.trim()) count += 1;
  if (query.segmentId) count += 1;
  return count;
}

export function countActiveEstablishmentProductFilters(
  query: Pick<ProductListQueryState, "establishmentId">,
  options?: { includeEstablishment?: boolean },
): number {
  let count = 0;
  if (options?.includeEstablishment && query.establishmentId) count += 1;
  return count;
}

export function clearProductListFilters(): ProductListQueryState {
  return {
    name: "",
    brand: "",
    weight: "",
    segmentId: "",
    establishmentId: "",
    sort: "",
    order: "",
  };
}

/** @deprecated Use clearProductListFilters */
export const clearAdminProductListFilters = clearProductListFilters;
/** @deprecated Use clearProductListFilters */
export const clearEstablishmentProductListFilters = clearProductListFilters;
