import { parseAsString } from "nuqs";

import {
  SUPPLIER_COMPANIES_LIST_DEFAULT_PARAMS,
  type FetchSupplierCompaniesListParams,
  type SortOrder,
  type SupplierCompanySortField,
} from "@/modules/admin/supplier-companies/types";

export const supplierCompanyListFilterParsers = {
  name: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  order: parseAsString.withDefault(""),
};

export const supplierCompanyListFilterUrlKeys = {
  name: "sc_name",
  sort: "sc_sort",
  order: "sc_order",
} as const;

export type SupplierCompanyListQueryState = {
  name: string;
  sort: string;
  order: string;
};

export function toSupplierCompaniesFetchParams(
  query: SupplierCompanyListQueryState,
): Omit<FetchSupplierCompaniesListParams, "page"> {
  return {
    totalPerPage: SUPPLIER_COMPANIES_LIST_DEFAULT_PARAMS.totalPerPage,
    sort: (query.sort as SupplierCompanySortField) || SUPPLIER_COMPANIES_LIST_DEFAULT_PARAMS.sort,
    order: (query.order as SortOrder) || SUPPLIER_COMPANIES_LIST_DEFAULT_PARAMS.order,
    ...(query.name.trim() ? { name: query.name.trim() } : {}),
  };
}

export function countActiveSupplierCompanyFilters(query: SupplierCompanyListQueryState): number {
  return query.name.trim() ? 1 : 0;
}

export function clearSupplierCompanyListFilters(): SupplierCompanyListQueryState {
  return { name: "", sort: "", order: "" };
}

export function toggleSupplierCompanySort(
  currentSort: string,
  currentOrder: string,
  field: SupplierCompanySortField,
): { sort: string; order: SortOrder } {
  if (currentSort !== field) return { sort: field, order: "ASC" };
  return { sort: field, order: currentOrder === "ASC" ? "DESC" : "ASC" };
}
