import { useQuery } from "@tanstack/react-query";
import { fetchPendingPaymentConfirmations } from "@/modules/debt-negotiation/services/pending-payment-confirmations";
import { getDefaultCompanyId } from "@/shared/config/env";

export function usePendingPaymentConfirmations(enabled: boolean) {
  const companyId = getDefaultCompanyId();
  return useQuery({
    queryKey: ["renegotiation", "pending-payment-confirmations", companyId],
    queryFn: () => fetchPendingPaymentConfirmations(companyId),
    enabled,
  });
}
