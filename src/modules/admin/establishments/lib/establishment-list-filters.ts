import { parseAsString } from "nuqs";

import {
  ESTABLISHMENTS_LIST_DEFAULT_PARAMS,
  type EstablishmentPaymentStatus,
  type EstablishmentSortField,
  type FetchEstablishmentsListParams,
  type SortOrder,
} from "@/modules/admin/establishments/types";

export const establishmentListFilterParsers = {
  name: parseAsString.withDefault(""),
  responsibleName: parseAsString.withDefault(""),
  phone: parseAsString.withDefault(""),
  addressState: parseAsString.withDefault(""),
  addressCity: parseAsString.withDefault(""),
  addressNeighborhood: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""),
  active: parseAsString.withDefault(""),
  supplierId: parseAsString.withDefault(""),
  productId: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  order: parseAsString.withDefault(""),
};

export const establishmentListFilterUrlKeys = {
  name: "e_name",
  responsibleName: "e_responsible",
  phone: "e_phone",
  addressState: "e_state",
  addressCity: "e_city",
  addressNeighborhood: "e_neighborhood",
  status: "e_status",
  active: "e_active",
  supplierId: "supplierId",
  productId: "productId",
  sort: "e_sort",
  order: "e_order",
} as const;

export type EstablishmentListQueryState = {
  name: string;
  responsibleName: string;
  phone: string;
  addressState: string;
  addressCity: string;
  addressNeighborhood: string;
  status: string;
  active: string;
  supplierId: string;
  productId: string;
  sort: string;
  order: string;
};

export function toEstablishmentsFetchParams(
  query: EstablishmentListQueryState,
): Omit<FetchEstablishmentsListParams, "page"> {
  const params: Omit<FetchEstablishmentsListParams, "page"> = {
    totalPerPage: ESTABLISHMENTS_LIST_DEFAULT_PARAMS.totalPerPage,
    sort: ESTABLISHMENTS_LIST_DEFAULT_PARAMS.sort,
    order: ESTABLISHMENTS_LIST_DEFAULT_PARAMS.order,
  };

  if (query.name.trim()) params.name = query.name.trim();
  if (query.responsibleName.trim()) params.responsibleName = query.responsibleName.trim();
  if (query.phone.trim()) params.phone = query.phone.trim();
  if (query.addressState.trim()) params.addressState = query.addressState.trim();
  if (query.addressCity.trim()) params.addressCity = query.addressCity.trim();
  if (query.addressNeighborhood.trim()) {
    params.addressNeighborhood = query.addressNeighborhood.trim();
  }
  if (query.status) params.status = query.status as EstablishmentPaymentStatus;
  if (query.active === "true") params.active = true;
  if (query.active === "false") params.active = false;
  if (query.supplierId) params.supplierId = query.supplierId;
  if (query.productId) params.productId = query.productId;
  if (query.sort) params.sort = query.sort as EstablishmentSortField;
  if (query.order) params.order = query.order as SortOrder;

  return params;
}

export function countActiveEstablishmentFilters(query: EstablishmentListQueryState): number {
  let count = 0;
  if (query.responsibleName.trim()) count += 1;
  if (query.phone.trim()) count += 1;
  if (query.addressState.trim()) count += 1;
  if (query.addressCity.trim()) count += 1;
  if (query.addressNeighborhood.trim()) count += 1;
  if (query.status) count += 1;
  if (query.active) count += 1;
  return count;
}

export function clearEstablishmentListFilters(): Partial<EstablishmentListQueryState> {
  return {
    responsibleName: "",
    phone: "",
    addressState: "",
    addressCity: "",
    addressNeighborhood: "",
    status: "",
    active: "",
  };
}
