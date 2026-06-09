import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";

import {
  createSegment,
  deleteSegment,
  updateSegment,
} from "@/modules/admin/segments/api/segments-api";
import { segmentDetailQueryKey } from "@/modules/admin/segments/hooks/useSegmentDetailQuery";
import { segmentsQueryKey } from "@/modules/admin/segments/hooks/useSegmentsInfiniteQuery";
import type {
  CreateSegmentPayload,
  FetchSegmentsListParams,
  SegmentsListPage,
  UpdateSegmentPayload,
} from "@/modules/admin/segments/types";

export function useSegmentMutations(listParams?: Omit<FetchSegmentsListParams, "page">) {
  const queryClient = useQueryClient();
  const listKey = listParams ? segmentsQueryKey(listParams) : ["segments", "list"];

  const invalidate = async (detailId?: string) => {
    await queryClient.invalidateQueries({ queryKey: ["segments", "list"] });
    if (detailId) {
      await queryClient.invalidateQueries({ queryKey: segmentDetailQueryKey(detailId) });
    }
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateSegmentPayload) => createSegment(payload),
    onSuccess: () => invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSegmentPayload }) =>
      updateSegment(id, payload),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSegment(id),
    onMutate: async (id) => {
      if (!listParams) return;
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<InfiniteData<SegmentsListPage>>(listKey);
      queryClient.setQueryData<InfiniteData<SegmentsListPage>>(listKey, (old) => {
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

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    listKey,
  };
}
