import type { PaginatedResponse } from "@/shared/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

export type SegmentSortField = "name" | "supplierCount";
export type SortOrder = "ASC" | "DESC";

export interface SegmentListItem {
  id: string;
  name: string;
  active: boolean;
  supplierCount: number;
  productsActive: number;
  productsPending: number;
  productsRejected: number;
}

export interface SegmentDetail {
  id: string;
  name: string;
  active: boolean;
}

export type SegmentsListPage = PaginatedResponse<SegmentListItem>;

export interface FetchSegmentsListParams {
  page: number;
  totalPerPage?: number;
  sort?: SegmentSortField;
  order?: SortOrder;
  active?: boolean;
}

export interface CreateSegmentPayload {
  name: string;
}

export interface UpdateSegmentPayload {
  name: string;
  active?: boolean;
}

export const SEGMENTS_LIST_DEFAULT_PARAMS = {
  totalPerPage: DEFAULT_PAGE_SIZE,
  sort: "name" as SegmentSortField,
  order: "ASC" as SortOrder,
};
