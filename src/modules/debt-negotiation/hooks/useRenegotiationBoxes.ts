import { useQuery } from "@tanstack/react-query";
import { fetchRenegotiationBoxes } from "@/modules/debt-negotiation/services/renegotiation-boxes";
import { getDefaultCompanyId } from "@/shared/config/env";
import { useDateRangeQueryState } from "@/shared/lib/nuqs-filters";

export function useRenegotiationBoxes(params?: {
  /** Multi-tenant: quando houver auth, passar companyId do token. Hoje usa getDefaultCompanyId(). */
  companyId?: number;
}) {
  const { startDate, endDate } = useDateRangeQueryState();
  const companyId = params?.companyId ?? getDefaultCompanyId();

  return useQuery({
    queryKey: ["renegotiation", "boxes", startDate, endDate, companyId],
    queryFn: () =>
      fetchRenegotiationBoxes({
        startDate,
        endDate,
        companyId,
      }),
  });
}
