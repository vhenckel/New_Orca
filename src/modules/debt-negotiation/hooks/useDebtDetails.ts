import { useQuery } from "@tanstack/react-query";
import { fetchDebtDetails } from "@/modules/debt-negotiation/services/debt-details";
import { getCurrentCompanyId } from "@/shared/auth/current-company";

const DEFAULT_PAGE_SIZE = 10;

export interface UseDebtDetailsParams {
  startDate?: string;
  endDate?: string;
  page?: number;
  /** Linhas por página (API take). Default 10. */
  pageSize?: number;
  companyId?: number;
  orderBy?: string;
  orderByDirection?: "ASC" | "DESC";
  statuses?: number[];
  /** Texto digitado no campo de busca (nome / documento). */
  search?: string;
}

export function useDebtDetails(params: UseDebtDetailsParams) {
  const { startDate, endDate } = params;
  const page = params.page ?? 1;
  const pageSize = params?.pageSize ?? DEFAULT_PAGE_SIZE;
  const companyId = params?.companyId ?? getCurrentCompanyId();
  const skip = (page - 1) * pageSize;
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
      pageSize,
      params?.orderBy,
      params?.orderByDirection,
      params?.statuses,
      hasSearch ? rawSearch : undefined,
    ],
    queryFn: () =>
      fetchDebtDetails({
        take: pageSize,
        skip,
        ...(startDate && endDate ? { startDate, endDate } : {}),
        companyId,
        orderBy: params?.orderBy ?? "contactName",
        orderByDirection: params?.orderByDirection ?? "DESC",
        statuses: params?.statuses?.length ? params.statuses : undefined,
        name: hasSearch ? rawSearch : undefined,
        document: hasSearch ? rawSearch : undefined,
      }),
  });
}

export { DEFAULT_PAGE_SIZE as DEBT_DETAILS_PAGE_SIZE };
