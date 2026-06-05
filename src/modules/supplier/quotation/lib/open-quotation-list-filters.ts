import { parseAsString } from "nuqs";

import type {
  FetchOpenQuotationsParams,
  OpenQuotationFilterStatus,
  OpenQuotationSortField,
  SortOrder,
} from "@/modules/supplier/quotation/types/open-quotation";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

export const openQuotationListFilterParsers = {
  status: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  order: parseAsString.withDefault(""),
};

export const openQuotationListFilterUrlKeys = {
  status: "sq_status",
  sort: "sq_sort",
  order: "sq_order",
} as const;

export interface OpenQuotationListQueryState {
  status: string;
  sort: string;
  order: string;
}

export function toOpenQuotationFetchParams(
  query: OpenQuotationListQueryState,
): Omit<FetchOpenQuotationsParams, "page"> {
  const params: Omit<FetchOpenQuotationsParams, "page"> = {
    totalPerPage: DEFAULT_PAGE_SIZE,
  };
  if (query.status) params.status = query.status as OpenQuotationFilterStatus;
  if (query.sort) params.sort = query.sort as OpenQuotationSortField;
  if (query.order) params.order = query.order as SortOrder;
  return params;
}

export function countActiveOpenQuotationFilters(query: OpenQuotationListQueryState): number {
  return query.status ? 1 : 0;
}
