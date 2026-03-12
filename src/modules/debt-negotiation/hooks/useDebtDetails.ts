import { useQuery } from "@tanstack/react-query";
import { fetchDebtDetails } from "@/modules/debt-negotiation/services/debt-details";
import { getDefaultCompanyId } from "@/shared/config/env";
import { useDateRangeQueryState } from "@/shared/lib/nuqs-filters";

const PAGE_SIZE = 20;

export function useDebtDetails(params?: {
  page?: number;
  companyId?: number;
  orderBy?: string;
  orderByDirection?: "ASC" | "DESC";
}) {
  const { startDate, endDate } = useDateRangeQueryState();
  const page = params?.page ?? 1;
  const companyId = params?.companyId ?? getDefaultCompanyId();
  const skip = (page - 1) * PAGE_SIZE;

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
      }),
  });
}

export { PAGE_SIZE as DEBT_DETAILS_PAGE_SIZE };
