import { useQuery } from "@tanstack/react-query";
import { fetchRenegotiationNps } from "@/modules/debt-negotiation/services/renegotiation-nps";
import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { useDateRangeQueryState } from "@/shared/lib/nuqs-filters";

export function useRenegotiationNps(params?: { companyId?: number }) {
  const { startDate, endDate } = useDateRangeQueryState();
  const companyId = params?.companyId ?? getCurrentCompanyId();

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
