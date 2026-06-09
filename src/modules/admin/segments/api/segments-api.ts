import type {
  CreateSegmentPayload,
  FetchSegmentsListParams,
  SegmentDetail,
  SegmentsListPage,
  UpdateSegmentPayload,
} from "@/modules/admin/segments/types";
import { apiRequest, apiRequestBlob } from "@/shared/api/http-client";
import { DEFAULT_PAGE_SIZE } from "@/shared/api/pagination";

function appendSegmentsFilterParams(
  search: URLSearchParams,
  params: Omit<FetchSegmentsListParams, "page">,
): void {
  if (params.sort) search.set("sort", params.sort);
  if (params.order) search.set("order", params.order);
  if (params.active !== undefined) search.set("active", String(params.active));
}

function buildSegmentsQuery(params: FetchSegmentsListParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("totalPerPage", String(params.totalPerPage ?? DEFAULT_PAGE_SIZE));
  appendSegmentsFilterParams(search, params);
  return search.toString();
}

function buildSegmentsCopyQuery(params: Omit<FetchSegmentsListParams, "page" | "totalPerPage">): string {
  const search = new URLSearchParams();
  appendSegmentsFilterParams(search, params);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchSegmentsPage(params: FetchSegmentsListParams): Promise<SegmentsListPage> {
  return apiRequest<SegmentsListPage>(`/segments?${buildSegmentsQuery(params)}`);
}

export async function fetchSegmentById(id: string): Promise<SegmentDetail> {
  return apiRequest<SegmentDetail>(`/segments/${id}`);
}

export async function copySegmentsTsv(
  params: Omit<FetchSegmentsListParams, "page" | "totalPerPage">,
): Promise<string> {
  const blob = await apiRequestBlob(`/segments/copy${buildSegmentsCopyQuery(params)}`);
  return blob.text();
}

export async function createSegment(payload: CreateSegmentPayload): Promise<SegmentDetail> {
  return apiRequest<SegmentDetail>("/segments", {
    method: "POST",
    body: payload,
  });
}

export async function updateSegment(id: string, payload: UpdateSegmentPayload): Promise<SegmentDetail> {
  return apiRequest<SegmentDetail>(`/segments/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteSegment(id: string): Promise<void> {
  return apiRequest<void>(`/segments/${id}`, {
    method: "DELETE",
  });
}
