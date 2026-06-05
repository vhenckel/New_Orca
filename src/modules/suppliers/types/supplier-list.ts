import type { PaginatedResponse } from "@/shared/api/pagination";

export type SupplierSortField = "name" | "responsible" | "establishment_count";
export type SortOrder = "ASC" | "DESC";

export interface SupplierListItem {
  id: string;
  name: string;
  responsibleName: string;
  responsibleEmail: string;
  minimumOrderValue: string;
  phone: string;
  establishmentCount: number;
}

export type SuppliersListPage = PaginatedResponse<SupplierListItem>;

export interface FetchSuppliersListParams {
  page: number;
  totalPerPage?: number;
  sort?: SupplierSortField;
  order?: SortOrder;
  name?: string;
  responsibleName?: string;
  phone?: string;
  email?: string;
  segmentId?: string;
  establishmentId?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
}

export const SUPPLIERS_LIST_DEFAULT_PARAMS = {
  totalPerPage: 15,
  sort: "name" as SupplierSortField,
  order: "ASC" as SortOrder,
};
