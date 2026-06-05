import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchBudgetById } from "@/modules/buyer/quotation/api/budgets-api";
import { fetchEstablishmentProductsAll } from "@/modules/buyer/quotation/api/establishment-products-api";
import { fetchMyEstablishments } from "@/modules/buyer/quotation/api/establishments-api";
import { buildCatalogIndex, catalogByBaseProductId } from "@/modules/buyer/quotation/lib/create-budget-mapper";

export function useMyEstablishments() {
  return useQuery({
    queryKey: ["establishments", "my"],
    queryFn: () => fetchMyEstablishments(),
  });
}

export function useEstablishmentProductsCatalog(establishmentId: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: ["establishment-products", "all", establishmentId],
    queryFn: () => fetchEstablishmentProductsAll(establishmentId!),
    enabled: Boolean(establishmentId) && enabled,
  });

  const index = useMemo(() => {
    if (!query.data) {
      return {
        catalog: [] as ReturnType<typeof buildCatalogIndex>["catalog"],
        byCompositeId: new Map(),
        brandIdByCompositeAndName: new Map(),
        byBaseId: new Map(),
      };
    }
    const built = buildCatalogIndex(query.data);
    return {
      ...built,
      byBaseId: catalogByBaseProductId(query.data),
    };
  }, [query.data]);

  return { ...query, ...index };
}

export function useBudgetDetail(budgetId: string | null) {
  return useQuery({
    queryKey: ["budgets", "detail", budgetId],
    queryFn: () => fetchBudgetById(budgetId!),
    enabled: Boolean(budgetId),
  });
}
