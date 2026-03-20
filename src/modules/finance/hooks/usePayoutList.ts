import { useQuery } from "@tanstack/react-query";

import type { ListPayoutFilters } from "@/modules/finance/types/payouts";
import { fetchPayoutList } from "@/modules/finance/services/payouts";

export function usePayoutList(month: number, year: number, filters: ListPayoutFilters) {
  return useQuery({
    queryKey: ["finance", "payout-list", month, year, filters],
    queryFn: () => fetchPayoutList(month, year, filters),
    enabled: month >= 1 && month <= 12 && year >= 2000 && year <= 2100,
  });
}
