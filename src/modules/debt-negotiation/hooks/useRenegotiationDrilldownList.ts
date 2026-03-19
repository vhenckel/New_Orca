import { useQuery } from "@tanstack/react-query";
import { fetchRenegotiationViewList } from "@/modules/debt-negotiation/services/renegotiation-view-list";
import type { RenegotiationViewListVariant } from "@/modules/debt-negotiation/services/renegotiation-view-list";
import { getCurrentCompanyId } from "@/shared/auth/current-company";

const DEFAULT_PAGE_SIZE = 10;

export interface UseRenegotiationDrilldownListParams {
  startDate: string;
  endDate: string;
  page?: number;
  pageSize?: number;
  companyId?: number;
  orderBy?: string;
  orderByDirection?: "ASC" | "DESC";
  statuses?: number[];
  search?: string;
}

export function useRenegotiationDrilldownList(
  variant: RenegotiationViewListVariant,
  params: UseRenegotiationDrilldownListParams,
) {
  const { startDate, endDate } = params;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const companyId = params.companyId ?? getCurrentCompanyId();
  const skip = (page - 1) * pageSize;
  const rawSearch = params?.search?.trim() ?? "";
  const hasSearch = rawSearch.length > 0;

  return useQuery({
    queryKey: [
      "renegotiation",
      "view-list",
      variant,
      startDate,
      endDate,
      companyId,
      page,
      pageSize,
      params?.orderBy,
      params?.orderByDirection,
      params?.statuses,
      hasSearch ? rawSearch : undefined,
    ],
    queryFn: () =>
      fetchRenegotiationViewList(variant, {
        take: pageSize,
        skip,
        startDate,
        endDate,
        companyId,
        orderBy: params.orderBy ?? "contactName",
        orderByDirection: params.orderByDirection ?? "DESC",
        statuses: params.statuses?.length ? params.statuses : undefined,
        /** API aceita nome ou documento no mesmo termo de busca. */
        name: hasSearch ? rawSearch : undefined,
        document: hasSearch ? rawSearch : undefined,
      }),
  });
}
