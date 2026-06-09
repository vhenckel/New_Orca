import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchSupplierCompaniesPage } from "@/modules/admin/supplier-companies/api/supplier-companies-api";
import type { FetchSupplierCompaniesListParams } from "@/modules/admin/supplier-companies/types";
import { getStoredUser } from "@/shared/auth/token-store";

export function supplierCompaniesQueryKey(params: Omit<FetchSupplierCompaniesListParams, "page">) {
  const userId = getStoredUser()?.id ?? "anonymous";
  return ["supplier-companies", "list", userId, params] as const;
}

export function useSupplierCompaniesInfiniteQuery(
  params: Omit<FetchSupplierCompaniesListParams, "page">,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: supplierCompaniesQueryKey(params),
    queryFn: ({ pageParam }) => fetchSupplierCompaniesPage({ ...params, page: pageParam }),
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
