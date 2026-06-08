import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchSolicitationsPage } from "@/modules/product/api/solicitations-api";
import type { FetchSolicitationsListParams } from "@/modules/product/types/pending-product";
import { getStoredUser } from "@/shared/auth/token-store";

export function pendingProductsQueryKey(params: Omit<FetchSolicitationsListParams, "page">) {
  const userId = getStoredUser()?.id ?? "anonymous";
  return ["solicitations", "list", userId, params] as const;
}

export function usePendingProductsInfiniteQuery(
  params: Omit<FetchSolicitationsListParams, "page">,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: pendingProductsQueryKey(params),
    queryFn: ({ pageParam }) => fetchSolicitationsPage({ ...params, page: pageParam }),
    initialPageParam: 1,
    enabled: options?.enabled ?? true,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.totalPerPage);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}
