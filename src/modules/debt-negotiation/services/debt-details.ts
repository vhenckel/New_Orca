import type { DebtDetailsParams, DebtDetailsResponse } from "@/modules/debt-negotiation/types/debt-details";
import { fetchRenegotiationViewList } from "@/modules/debt-negotiation/services/renegotiation-view-list";

export async function fetchDebtDetails(
  params: DebtDetailsParams,
): Promise<DebtDetailsResponse> {
  return fetchRenegotiationViewList("renegotiation", params);
}
