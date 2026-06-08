import { useQuery } from "@tanstack/react-query";

import { fetchEstablishmentById } from "@/modules/admin/establishments/api/establishments-api";

export function establishmentDetailQueryKey(id: string) {
  return ["establishments", "detail", id] as const;
}

export function useEstablishmentDetailQuery(id: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: establishmentDetailQueryKey(id ?? ""),
    queryFn: () => fetchEstablishmentById(id!),
    enabled: (options?.enabled ?? true) && Boolean(id),
    retry: false,
  });
}
