import { spotJson } from "@/shared/api/http-client";
import type { DebtDetailResponse } from "@/modules/debt-negotiation/types/debt-detail";

const RENEGOTIATION_DETAILS_PATH = "/renegotiation";

export async function fetchDebtDetail(renegotiationId: string): Promise<DebtDetailResponse> {
  return spotJson<DebtDetailResponse>(`${RENEGOTIATION_DETAILS_PATH}/${renegotiationId}/details`);
}
