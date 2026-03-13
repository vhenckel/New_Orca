import { useQuery } from "@tanstack/react-query";
import { fetchDebtDetails } from "@/modules/debt-negotiation/services/debt-details";
import { getDefaultCompanyId } from "@/shared/config/env";
import { useDateRangeQueryState } from "@/shared/lib/nuqs-filters";

const PAGE_SIZE = 20;

interface UseDebtDetailsParams {
  page?: number;
  companyId?: number;
  orderBy?: string;
  orderByDirection?: "ASC" | "DESC";
  statuses?: number[];
  /** Texto digitado no campo de busca (nome / documento). */
  search?: string;
}

export function useDebtDetails(params?: UseDebtDetailsParams) {
  const { startDate, endDate } = useDateRangeQueryState();
  const page = params?.page ?? 1;
  const companyId = params?.companyId ?? getDefaultCompanyId();
  const skip = (page - 1) * PAGE_SIZE;
  const rawSearch = params?.search?.trim() ?? "";
  const hasSearch = rawSearch.length > 0;

  return useQuery({
    queryKey: [
      "renegotiation",
      "debt-details",
      startDate,
      endDate,
      companyId,
      page,
      params?.orderBy,
      params?.orderByDirection,
      params?.statuses,
      hasSearch ? rawSearch : undefined,
    ],
    queryFn: () =>
      fetchDebtDetails({
        take: PAGE_SIZE,
        skip,
        startDate,
        endDate,
        companyId,
        orderBy: params?.orderBy ?? "contactName",
        orderByDirection: params?.orderByDirection ?? "DESC",
        statuses: params?.statuses?.length ? params.statuses : undefined,
        name: hasSearch ? rawSearch : undefined,
        document: hasSearch ? rawSearch : undefined,
      }),
  });
}

export { PAGE_SIZE as DEBT_DETAILS_PAGE_SIZE };
