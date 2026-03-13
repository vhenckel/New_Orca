import { useQuery } from "@tanstack/react-query";
import { fetchPendingPaymentConfirmations } from "@/modules/debt-negotiation/services/pending-payment-confirmations";
import { getCurrentCompanyId } from "@/shared/auth/current-company";

export function usePendingPaymentConfirmations(enabled: boolean) {
  const companyId = getCurrentCompanyId();
  return useQuery({
    queryKey: ["renegotiation", "pending-payment-confirmations", companyId],
    queryFn: () => fetchPendingPaymentConfirmations(companyId),
    enabled,
  });
}
