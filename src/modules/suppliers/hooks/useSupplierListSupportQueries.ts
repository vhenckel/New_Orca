import { useQuery } from "@tanstack/react-query";

import { fetchMyEstablishments } from "@/modules/buyer/quotation/api/establishments-api";
import { fetchAllSegments } from "@/modules/buyer/quotation/api/segments-api";
import {
  fetchLocationCities,
  fetchLocationStates,
} from "@/modules/suppliers/api/location-api";
import type { ApiUserRole } from "@/shared/auth/types";

export function useSupplierListSupportQueries(role: ApiUserRole | null) {
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

export function useLocationStatesQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["location", "states"],
    queryFn: fetchLocationStates,
    enabled,
    staleTime: 60_000 * 30,
  });
}

export function useLocationCitiesQuery(uf: string, enabled: boolean) {
  return useQuery({
    queryKey: ["location", "cities", uf],
    queryFn: () => fetchLocationCities(uf),
    enabled: enabled && Boolean(uf),
    staleTime: 60_000 * 10,
  });
}
