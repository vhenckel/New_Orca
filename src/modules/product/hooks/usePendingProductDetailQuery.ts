import { useQuery } from "@tanstack/react-query";

import { fetchSolicitationById } from "@/modules/product/api/solicitations-api";

export function pendingProductDetailQueryKey(solicitationId: string) {
  return ["solicitations", "detail", solicitationId] as const;
}

export function usePendingProductDetailQuery(
  solicitationId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: pendingProductDetailQueryKey(solicitationId ?? ""),
    queryFn: () => fetchSolicitationById(solicitationId!),
    enabled: Boolean(solicitationId) && (options?.enabled ?? true),
    retry: false,
  });
}
