import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchSuppliersPage } from "@/modules/suppliers/api/suppliers-api";
import type { FetchSuppliersListParams } from "@/modules/suppliers/types/supplier-list";
import { getStoredUser } from "@/shared/auth/token-store";

export function suppliersQueryKey(params: Omit<FetchSuppliersListParams, "page">) {
  const userId = getStoredUser()?.id ?? "anonymous";
  return ["suppliers", "list", userId, params] as const;
}

export function useSuppliersInfiniteQuery(
  params: Omit<FetchSuppliersListParams, "page">,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: suppliersQueryKey(params),
    queryFn: ({ pageParam }) => fetchSuppliersPage({ ...params, page: pageParam }),
    initialPageParam: 1,
    enabled: options?.enabled ?? true,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.totalPerPage);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}
