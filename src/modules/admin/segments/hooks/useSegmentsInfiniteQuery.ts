import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchSegmentsPage } from "@/modules/admin/segments/api/segments-api";
import type { FetchSegmentsListParams } from "@/modules/admin/segments/types";
import { getStoredUser } from "@/shared/auth/token-store";

export function segmentsQueryKey(params: Omit<FetchSegmentsListParams, "page">) {
  const userId = getStoredUser()?.id ?? "anonymous";
  return ["segments", "list", userId, params] as const;
}

export function useSegmentsInfiniteQuery(
  params: Omit<FetchSegmentsListParams, "page">,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: segmentsQueryKey(params),
    queryFn: ({ pageParam }) => fetchSegmentsPage({ ...params, page: pageParam }),
    initialPageParam: 1,
    enabled: options?.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.totalPerPage);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}
