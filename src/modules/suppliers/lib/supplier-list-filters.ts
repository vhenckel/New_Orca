import { parseAsString } from "nuqs";

import {
  SUPPLIERS_LIST_DEFAULT_PARAMS,
  type FetchSuppliersListParams,
  type SupplierSortField,
  type SortOrder,
} from "@/modules/suppliers/types/supplier-list";

export const supplierListFilterParsers = {
  name: parseAsString.withDefault(""),
  responsibleName: parseAsString.withDefault(""),
  phone: parseAsString.withDefault(""),
  email: parseAsString.withDefault(""),
  segmentId: parseAsString.withDefault(""),
  establishmentId: parseAsString.withDefault(""),
  state: parseAsString.withDefault(""),
  city: parseAsString.withDefault(""),
  neighborhood: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  order: parseAsString.withDefault(""),
};

export const supplierListFilterUrlKeys = {
  name: "s_name",
  responsibleName: "s_responsible",
  phone: "s_phone",
  email: "s_email",
  segmentId: "s_segmentId",
  establishmentId: "s_establishmentId",
  state: "s_state",
  city: "s_city",
  neighborhood: "s_neighborhood",
  sort: "s_sort",
  order: "s_order",
} as const;

export type SupplierListQueryState = {
  name: string;
  responsibleName: string;
  phone: string;
  email: string;
  segmentId: string;
  establishmentId: string;
  state: string;
  city: string;
  neighborhood: string;
  sort: string;
  order: string;
};

export function toSuppliersFetchParams(
  query: SupplierListQueryState,
): Omit<FetchSuppliersListParams, "page"> {
  const params: Omit<FetchSuppliersListParams, "page"> = {
    totalPerPage: SUPPLIERS_LIST_DEFAULT_PARAMS.totalPerPage,
    sort: SUPPLIERS_LIST_DEFAULT_PARAMS.sort,
    order: SUPPLIERS_LIST_DEFAULT_PARAMS.order,
  };

  if (query.name.trim()) params.name = query.name.trim();
  if (query.responsibleName.trim()) params.responsibleName = query.responsibleName.trim();
  if (query.phone.trim()) params.phone = query.phone.trim();
  if (query.email.trim()) params.email = query.email.trim();
  if (query.segmentId) params.segmentId = query.segmentId;
  if (query.establishmentId) params.establishmentId = query.establishmentId;
  if (query.state.trim()) params.state = query.state.trim();
  if (query.city.trim()) params.city = query.city.trim();
  if (query.neighborhood.trim()) params.neighborhood = query.neighborhood.trim();
  if (query.sort) params.sort = query.sort as SupplierSortField;
  if (query.order) params.order = query.order as SortOrder;

  return params;
}

export function countActiveSupplierFilters(
  query: SupplierListQueryState,
  options?: { includeEstablishment?: boolean },
): number {
  let count = 0;
  if (query.responsibleName.trim()) count += 1;
  if (query.phone.trim()) count += 1;
  if (query.email.trim()) count += 1;
  if (query.segmentId) count += 1;
  if (options?.includeEstablishment && query.establishmentId) count += 1;
  if (query.state.trim()) count += 1;
  if (query.city.trim()) count += 1;
  if (query.neighborhood.trim()) count += 1;
  return count;
}

export function clearSupplierListFilters(): Partial<SupplierListQueryState> {
  return {
    responsibleName: "",
    phone: "",
    email: "",
    segmentId: "",
    establishmentId: "",
    state: "",
    city: "",
    neighborhood: "",
  };
}
