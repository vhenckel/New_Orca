import { getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";
import type { DebtDetailResponse } from "@/modules/debt-negotiation/types/debt-detail";

const RENEGOTIATION_DETAILS_PATH = "/trinity/renegotiation";

export async function fetchDebtDetail(renegotiationId: string): Promise<DebtDetailResponse> {
  const url = `${spotApiBaseUrl}${RENEGOTIATION_DETAILS_PATH}/${renegotiationId}/details`;
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Debt detail API error: ${res.status}`);
  }
  return res.json();
}
