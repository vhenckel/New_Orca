import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchOpenQuotations } from "@/modules/supplier/quotation/api/open-quotations-api";
import type { FetchOpenQuotationsParams } from "@/modules/supplier/quotation/types/open-quotation";
import { getStoredUser } from "@/shared/auth/token-store";

export function openQuotationsQueryKey(params: Omit<FetchOpenQuotationsParams, "page">) {
  const userId = getStoredUser()?.id ?? "anonymous";
  return ["open-quotations", userId, params] as const;
}

export function useOpenQuotationsInfiniteQuery(params: Omit<FetchOpenQuotationsParams, "page">) {
  return useInfiniteQuery({
    queryKey: openQuotationsQueryKey(params),
    queryFn: ({ pageParam }) => fetchOpenQuotations({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.totalPerPage);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}
