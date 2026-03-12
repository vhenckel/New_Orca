import { useQuery } from "@tanstack/react-query";
import { fetchRenegotiationNps } from "@/modules/debt-negotiation/services/renegotiation-nps";
import { getDefaultCompanyId } from "@/shared/config/env";
import { useDateRangeQueryState } from "@/shared/lib/nuqs-filters";

export function useRenegotiationNps(params?: { companyId?: number }) {
  const { startDate, endDate } = useDateRangeQueryState();
  const companyId = params?.companyId ?? getDefaultCompanyId();

  return useQuery({
    queryKey: ["renegotiation", "nps", startDate, endDate, companyId],
    queryFn: () =>
      fetchRenegotiationNps({
        startDate,
        endDate,
        companyId,
      }),
  });
}
