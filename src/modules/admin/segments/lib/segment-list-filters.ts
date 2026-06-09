import { parseAsString } from "nuqs";

import {
  SEGMENTS_LIST_DEFAULT_PARAMS,
  type FetchSegmentsListParams,
  type SegmentSortField,
  type SortOrder,
} from "@/modules/admin/segments/types";

export const segmentListFilterParsers = {
  active: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  order: parseAsString.withDefault(""),
};

export const segmentListFilterUrlKeys = {
  active: "seg_active",
  sort: "seg_sort",
  order: "seg_order",
} as const;

export type SegmentListQueryState = {
  active: string;
  sort: string;
  order: string;
};

export function toSegmentsFetchParams(
  query: SegmentListQueryState,
): Omit<FetchSegmentsListParams, "page"> {
  const params: Omit<FetchSegmentsListParams, "page"> = {
    totalPerPage: SEGMENTS_LIST_DEFAULT_PARAMS.totalPerPage,
    sort: (query.sort as SegmentSortField) || SEGMENTS_LIST_DEFAULT_PARAMS.sort,
    order: (query.order as SortOrder) || SEGMENTS_LIST_DEFAULT_PARAMS.order,
  };

  if (query.active === "true") params.active = true;
  if (query.active === "false") params.active = false;

  return params;
}

export function countActiveSegmentFilters(query: SegmentListQueryState): number {
  return query.active ? 1 : 0;
}

export function clearSegmentListFilters(): SegmentListQueryState {
  return {
    active: "",
    sort: "",
    order: "",
  };
}
