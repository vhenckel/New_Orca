import type { PaginatedResponse } from "@/shared/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

import type { ApprovalStatus } from "@/modules/product/lib/product-constants";

export type SolicitationType = "product_creation" | "brand_addition";

export type SolicitationSortField = "name" | "createdAt" | "status" | "type";
export type SortOrder = "ASC" | "DESC";

export interface SolicitationEstablishment {
  id: string;
  name: string;
}

export interface SolicitationListItem {
  id: string;
  type: SolicitationType;
  status: ApprovalStatus;
  establishment: SolicitationEstablishment;
  product: { id: string; name: string };
  brand?: { id: string; name: string } | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendingProductBrand {
  id: string;
  name: string;
  gtin?: string | null;
  status: ApprovalStatus;
  productId?: string;
  establishmentId?: string | null;
  solicitorEstablishment?: SolicitationEstablishment | null;
}

export interface PendingProductDetail {
  id: string;
  name: string;
  unitType: string;
  packagingUnit?: { unit: string; weight: number } | null;
  segments: Array<{ id: string; name: string }>;
  ncm?: string | null;
  status: ApprovalStatus;
  type: SolicitationType;
  establishmentId?: string | null;
  solicitorEstablishmentId?: string | null;
  solicitorEstablishment?: SolicitationEstablishment | null;
  brands: PendingProductBrand[];
}

export interface FetchSolicitationsListParams {
  page: number;
  totalPerPage?: number;
  sort?: SolicitationSortField;
  order?: SortOrder;
  status?: ApprovalStatus;
  type?: SolicitationType;
  name?: string;
  establishmentId?: string;
  segmentId?: string;
}

export type SolicitationsListPage = PaginatedResponse<SolicitationListItem>;

export const PENDING_PRODUCTS_LIST_DEFAULT_PARAMS = {
  totalPerPage: DEFAULT_PAGE_SIZE,
  sort: "createdAt" as const,
  order: "DESC" as const,
  status: "pending" as const,
};

export interface PendingProductModerationBrand {
  id?: string;
  name: string;
  gtin?: string;
  status?: ApprovalStatus;
  establishmentId?: string;
}

export interface PendingProductModerationPayload {
  name: string;
  brands: PendingProductModerationBrand[];
  unitType: string;
  packagingUnit?: { unit: string; weight: number };
  segmentIds: string[];
  ncm?: string;
  establishmentId?: string;
  solicitorEstablishmentId?: string;
  quoteAnyBrand?: boolean;
}
