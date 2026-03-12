import { useQuery } from "@tanstack/react-query";
import { fetchDebtDetail } from "@/modules/debt-negotiation/services/debt-detail";

export function useDebtDetail(renegotiationId: string | null) {
  return useQuery({
    queryKey: ["renegotiation", "debt-detail", renegotiationId],
    queryFn: () => fetchDebtDetail(renegotiationId!),
    enabled: Boolean(renegotiationId),
  });
}
