import type { PaginatedResponse } from "@/shared/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

export type ProductSortField = "name";
export type EstablishmentProductSortField = "name" | "createdAt" | "establishmentId";
export type SortOrder = "ASC" | "DESC";

export interface ProductPackagingUnit {
  unit: string;
  weight: number;
}

export interface ProductListBrand {
  id: string;
  name: string;
  status?: string;
}

/** Item da listagem admin (`GET /products`). */
export interface AdminProductListItem {
  id: string;
  name: string;
  unitType: string;
  packagingUnit?: ProductPackagingUnit | null;
  brands: ProductListBrand[];
  segments: string[];
  establishmentCount: number;
  supplierCount: number;
}

/** Item da listagem establishment (`GET /establishment-products`). */
export interface EstablishmentProductListItem {
  id: string;
  establishmentProductId: string;
  productId: string;
  name: string;
  unitType: string;
  packagingUnit?: ProductPackagingUnit | null;
  brands: ProductListBrand[];
  segments: Array<{ id: string; name: string }>;
  establishment: { id: string; name: string };
  quoteAnyBrand: boolean;
  status: string;
  createdAt: string;
}

export interface FetchProductsListParams {
  page: number;
  totalPerPage?: number;
  sort?: ProductSortField;
  order?: SortOrder;
  name?: string;
  brand?: string;
  weight?: number;
  segmentId?: string;
  status?: "approved" | "pending" | "rejected";
}

export interface FetchEstablishmentProductsListParams {
  page: number;
  totalPerPage?: number;
  sort?: EstablishmentProductSortField;
  order?: SortOrder;
  name?: string;
  establishmentId?: string;
}

export type ProductsListPage = PaginatedResponse<AdminProductListItem>;
export type EstablishmentProductsListPage = PaginatedResponse<EstablishmentProductListItem>;

export const PRODUCTS_LIST_DEFAULT_PARAMS = {
  totalPerPage: DEFAULT_PAGE_SIZE,
  status: "approved" as const,
};

export const ESTABLISHMENT_PRODUCTS_LIST_DEFAULT_SORT: {
  sort: EstablishmentProductSortField;
  order: SortOrder;
} = {
  sort: "name",
  order: "ASC",
};
