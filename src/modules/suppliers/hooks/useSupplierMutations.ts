import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createSupplier,
  deleteSupplier,
  linkSupplierEstablishment,
  unlinkSupplierEstablishment,
  updateSupplier,
} from "@/modules/suppliers/api/suppliers-api";
import { supplierDetailQueryKey } from "@/modules/suppliers/hooks/useSupplierDetailQuery";
import { suppliersQueryKey } from "@/modules/suppliers/hooks/useSuppliersInfiniteQuery";
import type {
  CreateSupplierPayload,
  UpdateSupplierPayload,
} from "@/modules/suppliers/types/supplier-detail";
import type { FetchSuppliersListParams } from "@/modules/suppliers/types/supplier-list";

export function useSupplierMutations(listParams?: Omit<FetchSuppliersListParams, "page">) {
  const queryClient = useQueryClient();
  const listKey = listParams ? suppliersQueryKey(listParams) : ["suppliers", "list"];

  const invalidate = async (detailId?: string) => {
    await queryClient.invalidateQueries({ queryKey: ["suppliers", "list"] });
    if (detailId) {
      await queryClient.invalidateQueries({ queryKey: supplierDetailQueryKey(detailId) });
    }
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateSupplierPayload) => createSupplier(payload),
    onSuccess: () => invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSupplierPayload }) =>
      updateSupplier(id, payload),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => invalidate(),
  });

  const linkMutation = useMutation({
    mutationFn: ({
      supplierId,
      establishmentId,
    }: {
      supplierId: string;
      establishmentId: string;
    }) => linkSupplierEstablishment(supplierId, establishmentId),
    onSuccess: (_data, variables) => invalidate(variables.supplierId),
  });

  const unlinkMutation = useMutation({
    mutationFn: ({
      supplierId,
      establishmentId,
    }: {
      supplierId: string;
      establishmentId: string;
    }) => unlinkSupplierEstablishment(supplierId, establishmentId),
    onSuccess: (_data, variables) => invalidate(variables.supplierId),
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    linkMutation,
    unlinkMutation,
    listKey,
  };
}
