import { useQuery } from "@tanstack/react-query";

import { fetchMyEstablishments } from "@/modules/buyer/quotation/api/establishments-api";
import { fetchAllSegments } from "@/modules/buyer/quotation/api/segments-api";
import type { ApiUserRole } from "@/shared/auth/types";

export function useProductListSupportQueries(role: ApiUserRole | null) {
  const segmentsQuery = useQuery({
    queryKey: ["segments", "all"],
    queryFn: fetchAllSegments,
    enabled: role === "admin" || role === "establishment",
  });

  const establishmentsQuery = useQuery({
    queryKey: ["establishments", "my"],
    queryFn: () => fetchMyEstablishments(),
    enabled: role === "admin" || role === "establishment",
  });

  return {
    segments: segmentsQuery.data ?? [],
    establishments: establishmentsQuery.data ?? [],
    isLoadingSupport: segmentsQuery.isLoading || establishmentsQuery.isLoading,
  };
}
