import { useQuery } from "@tanstack/react-query";

import { fetchSegmentById } from "@/modules/admin/segments/api/segments-api";

export function segmentDetailQueryKey(id: string) {
  return ["segments", "detail", id] as const;
}

export function useSegmentDetailQuery(id: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: segmentDetailQueryKey(id ?? ""),
    queryFn: () => fetchSegmentById(id!),
    enabled: (options?.enabled ?? true) && Boolean(id),
    retry: false,
  });
}
