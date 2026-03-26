import { useQuery } from "@tanstack/react-query";

import { fetchRenegotiationPlanUsage } from "@/modules/debt-negotiation/services/renegotiation-plan-usage";
import { getCurrentCompanyId } from "@/shared/auth/current-company";

export function useRenegotiationPlanUsage(params?: { companyId?: number }) {
  const companyId = params?.companyId ?? getCurrentCompanyId();

  return useQuery({
    queryKey: ["renegotiation", "plan-usage", companyId],
    queryFn: () =>
      fetchRenegotiationPlanUsage({
        companyId,
      }),
  });
}
