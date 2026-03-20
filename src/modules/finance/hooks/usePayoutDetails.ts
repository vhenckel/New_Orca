import { useQuery } from "@tanstack/react-query";

import type { GetPayoutItemsFilters } from "@/modules/finance/types/payouts";
import { fetchPayoutDetails } from "@/modules/finance/services/payouts";

export function usePayoutDetails(payoutId: number | null, filters: GetPayoutItemsFilters) {
  return useQuery({
    queryKey: ["finance", "payout-details", payoutId, filters],
    queryFn: () => fetchPayoutDetails(Number(payoutId), filters),
    enabled: payoutId != null && payoutId > 0,
  });
}
