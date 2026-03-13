import { useQuery } from "@tanstack/react-query";
import { fetchRenegotiationGraphics } from "@/modules/debt-negotiation/services/renegotiation-graphics";
import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { useDateRangeQueryState } from "@/shared/lib/nuqs-filters";

export function useRenegotiationGraphics(params?: { companyId?: number }) {
  const { startDate, endDate } = useDateRangeQueryState();
  const companyId = params?.companyId ?? getCurrentCompanyId();

  return useQuery({
    queryKey: ["renegotiation", "graphics", startDate, endDate, companyId],
    queryFn: () =>
      fetchRenegotiationGraphics({
        startDate,
        endDate,
        companyId,
      }),
  });
}
