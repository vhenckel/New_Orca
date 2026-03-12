import { useQuery } from "@tanstack/react-query";
import { fetchRenegotiationDetails } from "@/modules/debt-negotiation/services/renegotiation-details";
import { getDefaultCompanyId } from "@/shared/config/env";
import { useDateRangeQueryState } from "@/shared/lib/nuqs-filters";

export function useRenegotiationDetails(params?: {
  companyId?: number;
  viewType?: "daily";
  showValues?: "quantity" | "value";
}) {
  const { startDate, endDate } = useDateRangeQueryState();
  const companyId = params?.companyId ?? getDefaultCompanyId();
  const viewType = params?.viewType ?? "daily";
  const showValues = params?.showValues ?? "quantity";

  return useQuery({
    queryKey: ["renegotiation", "details", startDate, endDate, companyId, viewType, showValues],
    queryFn: () =>
      fetchRenegotiationDetails({
        startDate,
        endDate,
        companyId,
        viewType,
        showValues,
      }),
  });
}
