import { useQuery } from "@tanstack/react-query";
import { fetchRenegotiationBoxes } from "@/modules/debt-negotiation/services/renegotiation-boxes";
import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { useDateRangeQueryState } from "@/shared/lib/nuqs-filters";

export function useRenegotiationBoxes(params?: {
  /** Multi-tenant: companyId do token (troca de empresa) ou params. */
  companyId?: number;
}) {
  const { startDate, endDate } = useDateRangeQueryState();
  const companyId = params?.companyId ?? getCurrentCompanyId();

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
