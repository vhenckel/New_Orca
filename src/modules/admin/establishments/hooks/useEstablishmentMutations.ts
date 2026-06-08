import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";

import {
  createEstablishment,
  deleteEstablishment,
  linkEstablishmentSupplier,
  unlinkEstablishmentSupplier,
  updateEstablishment,
} from "@/modules/admin/establishments/api/establishments-api";
import { establishmentDetailQueryKey } from "@/modules/admin/establishments/hooks/useEstablishmentDetailQuery";
import { establishmentsQueryKey } from "@/modules/admin/establishments/hooks/useEstablishmentsInfiniteQuery";
import type {
  CreateEstablishmentPayload,
  EstablishmentsListPage,
  FetchEstablishmentsListParams,
  UpdateEstablishmentPayload,
} from "@/modules/admin/establishments/types";

export function useEstablishmentMutations(listParams?: Omit<FetchEstablishmentsListParams, "page">) {
  const queryClient = useQueryClient();
  const listKey = listParams ? establishmentsQueryKey(listParams) : ["establishments", "list"];

  const invalidate = async (detailId?: string) => {
    await queryClient.invalidateQueries({ queryKey: ["establishments", "list"] });
    if (detailId) {
      await queryClient.invalidateQueries({ queryKey: establishmentDetailQueryKey(detailId) });
    }
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateEstablishmentPayload) => createEstablishment(payload),
    onSuccess: () => invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEstablishmentPayload }) =>
      updateEstablishment(id, payload),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEstablishment(id),
    onMutate: async (id) => {
      if (!listParams) return;
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<InfiniteData<EstablishmentsListPage>>(listKey);
      queryClient.setQueryData<InfiniteData<EstablishmentsListPage>>(listKey, (old) => {
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

  const linkSupplierMutation = useMutation({
    mutationFn: ({
      establishmentId,
      supplierId,
    }: {
      establishmentId: string;
      supplierId: string;
    }) => linkEstablishmentSupplier(establishmentId, supplierId),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["suppliers", "establishment", variables.establishmentId],
      });
      await invalidate(variables.establishmentId);
    },
  });

  const unlinkSupplierMutation = useMutation({
    mutationFn: ({
      establishmentId,
      supplierId,
    }: {
      establishmentId: string;
      supplierId: string;
    }) => unlinkEstablishmentSupplier(establishmentId, supplierId),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["suppliers", "establishment", variables.establishmentId],
      });
      await invalidate(variables.establishmentId);
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    linkSupplierMutation,
    unlinkSupplierMutation,
    listKey,
  };
}
