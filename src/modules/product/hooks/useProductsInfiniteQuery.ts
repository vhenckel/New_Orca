import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchProductsPage } from "@/modules/product/api/products-api";
import type { FetchProductsListParams } from "@/modules/product/types/product-list";
import { getStoredUser } from "@/shared/auth/token-store";

export function productsQueryKey(params: Omit<FetchProductsListParams, "page">) {
  const userId = getStoredUser()?.id ?? "anonymous";
  return ["products", "list", userId, params] as const;
}

export function useProductsInfiniteQuery(
  params: Omit<FetchProductsListParams, "page">,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: productsQueryKey(params),
    queryFn: ({ pageParam }) => fetchProductsPage({ ...params, page: pageParam }),
    initialPageParam: 1,
    enabled: options?.enabled ?? true,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.totalPerPage);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}
