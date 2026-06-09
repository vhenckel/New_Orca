import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";

import {
  createSupplierCompany,
  deleteSupplierCompany,
  updateSupplierCompany,
} from "@/modules/admin/supplier-companies/api/supplier-companies-api";
import { supplierCompanyDetailQueryKey } from "@/modules/admin/supplier-companies/hooks/useSupplierCompanyDetailQuery";
import { supplierCompaniesQueryKey } from "@/modules/admin/supplier-companies/hooks/useSupplierCompaniesInfiniteQuery";
import type {
  FetchSupplierCompaniesListParams,
  SupplierCompaniesListPage,
  SupplierCompanyPayload,
} from "@/modules/admin/supplier-companies/types";

export function useSupplierCompanyMutations(listParams?: Omit<FetchSupplierCompaniesListParams, "page">) {
  const queryClient = useQueryClient();
  const listKey = listParams ? supplierCompaniesQueryKey(listParams) : ["supplier-companies", "list"];

  const invalidate = async (detailId?: string) => {
    await queryClient.invalidateQueries({ queryKey: ["supplier-companies", "list"] });
    if (detailId) {
      await queryClient.invalidateQueries({ queryKey: supplierCompanyDetailQueryKey(detailId) });
    }
  };

  const createMutation = useMutation({
    mutationFn: (payload: SupplierCompanyPayload) => createSupplierCompany(payload),
    onSuccess: () => invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SupplierCompanyPayload }) =>
      updateSupplierCompany(id, payload),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSupplierCompany(id),
    onMutate: async (id) => {
      if (!listParams) return;
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<InfiniteData<SupplierCompaniesListPage>>(listKey);
      queryClient.setQueryData<InfiniteData<SupplierCompaniesListPage>>(listKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((item) => item.id !== id),
            total: Math.max(0, page.total - 1),
          })),
        };
      });
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
    },
    onSettled: () => invalidate(),
  });

  return { createMutation, updateMutation, deleteMutation, listKey };
}
