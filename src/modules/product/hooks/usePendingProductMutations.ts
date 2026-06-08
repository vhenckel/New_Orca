import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  approveProduct,
  approveProductBrand,
  rejectProduct,
  rejectProductBrand,
  updatePendingProduct,
} from "@/modules/product/api/products-api";
import { pendingProductDetailQueryKey } from "@/modules/product/hooks/usePendingProductDetailQuery";
import { pendingProductsQueryKey } from "@/modules/product/hooks/usePendingProductsInfiniteQuery";
import type {
  FetchSolicitationsListParams,
  PendingProductModerationPayload,
} from "@/modules/product/types/pending-product";

interface UsePendingProductMutationsOptions {
  productId: string;
  solicitationId: string;
  listParams: Omit<FetchSolicitationsListParams, "page">;
  onProductModerated?: () => void;
}

export function usePendingProductMutations({
  productId,
  solicitationId,
  listParams,
  onProductModerated,
}: UsePendingProductMutationsOptions) {
  const queryClient = useQueryClient();
  const detailKey = pendingProductDetailQueryKey(solicitationId);
  const listKey = pendingProductsQueryKey(listParams);

  const invalidateDetail = () => {
    void queryClient.invalidateQueries({ queryKey: detailKey });
    void queryClient.invalidateQueries({ queryKey: listKey });
    void queryClient.invalidateQueries({ queryKey: ["products", "list"] });
  };

  const updateMutation = useMutation({
    mutationFn: (payload: PendingProductModerationPayload) =>
      updatePendingProduct(productId, payload),
    onSuccess: invalidateDetail,
  });

  const approveMutation = useMutation({
    mutationFn: (payload?: PendingProductModerationPayload) =>
      approveProduct(productId, payload),
    onSuccess: () => {
      invalidateDetail();
      onProductModerated?.();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (payload?: PendingProductModerationPayload) =>
      rejectProduct(productId, payload),
    onSuccess: () => {
      invalidateDetail();
      onProductModerated?.();
    },
  });

  const approveBrandMutation = useMutation({
    mutationFn: ({
      brandId,
      payload,
    }: {
      brandId: string;
      payload?: PendingProductModerationPayload;
    }) => approveProductBrand(productId, brandId, payload),
    onSuccess: invalidateDetail,
  });

  const rejectBrandMutation = useMutation({
    mutationFn: ({
      brandId,
      payload,
    }: {
      brandId: string;
      payload?: PendingProductModerationPayload;
    }) => rejectProductBrand(productId, brandId, payload),
    onSuccess: invalidateDetail,
  });

  return {
    updateMutation,
    approveMutation,
    rejectMutation,
    approveBrandMutation,
    rejectBrandMutation,
    isSaving:
      updateMutation.isPending ||
      approveMutation.isPending ||
      rejectMutation.isPending ||
      approveBrandMutation.isPending ||
      rejectBrandMutation.isPending,
  };
}
