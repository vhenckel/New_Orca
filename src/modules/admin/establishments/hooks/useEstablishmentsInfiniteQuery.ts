import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchEstablishmentsPage } from "@/modules/admin/establishments/api/establishments-api";
import type { FetchEstablishmentsListParams } from "@/modules/admin/establishments/types";
import { getStoredUser } from "@/shared/auth/token-store";

export function establishmentsQueryKey(params: Omit<FetchEstablishmentsListParams, "page">) {
  const userId = getStoredUser()?.id ?? "anonymous";
  return ["establishments", "list", userId, params] as const;
}

export function useEstablishmentsInfiniteQuery(
  params: Omit<FetchEstablishmentsListParams, "page">,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: establishmentsQueryKey(params),
    queryFn: ({ pageParam }) => fetchEstablishmentsPage({ ...params, page: pageParam }),
    initialPageParam: 1,
    enabled: options?.enabled ?? true,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.totalPerPage);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}
