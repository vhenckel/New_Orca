import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchBudgets } from "@/modules/buyer/quotation/api/budgets-api";
import type { FetchBudgetsParams } from "@/modules/buyer/quotation/types/budget";
import { getStoredUser } from "@/shared/auth/token-store";

export function budgetsQueryKey(params: Omit<FetchBudgetsParams, "page">) {
  const userId = getStoredUser()?.id ?? "anonymous";
  return ["budgets", userId, params] as const;
}

export function useBudgetsInfiniteQuery(params: Omit<FetchBudgetsParams, "page">) {
  return useInfiniteQuery({
    queryKey: budgetsQueryKey(params),
    queryFn: ({ pageParam }) => fetchBudgets({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.totalPerPage);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}
