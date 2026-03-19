import { useQuery } from "@tanstack/react-query";

import { fetchPayoutInvoice } from "@/modules/finance/services/payouts";

export function usePayoutInvoice(payoutId: number | null, enabled = true) {
  return useQuery({
    queryKey: ["finance", "payout-invoice", payoutId],
    queryFn: () => fetchPayoutInvoice(Number(payoutId)),
    enabled: enabled && payoutId != null && payoutId > 0,
  });
}
