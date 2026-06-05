import { apiRequest } from "@/shared/api/http-client";

export interface SegmentOption {
  id: string;
  name: string;
}

export async function fetchAllSegments(): Promise<SegmentOption[]> {
  return apiRequest<SegmentOption[]>("/segments/all");
}
