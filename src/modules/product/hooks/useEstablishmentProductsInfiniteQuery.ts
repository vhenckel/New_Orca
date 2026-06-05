import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchEstablishmentProductsPage } from "@/modules/product/api/establishment-products-api";
import type { FetchEstablishmentProductsListParams } from "@/modules/product/types/product-list";
import { getStoredUser } from "@/shared/auth/token-store";

export function establishmentProductsQueryKey(
  params: Omit<FetchEstablishmentProductsListParams, "page">,
) {
  const userId = getStoredUser()?.id ?? "anonymous";
  return ["establishment-products", "list", userId, params] as const;
}

export function useEstablishmentProductsInfiniteQuery(
  params: Omit<FetchEstablishmentProductsListParams, "page">,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: establishmentProductsQueryKey(params),
    queryFn: ({ pageParam }) =>
      fetchEstablishmentProductsPage({ ...params, page: pageParam }),
    initialPageParam: 1,
    enabled: options?.enabled ?? true,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.totalPerPage);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}
