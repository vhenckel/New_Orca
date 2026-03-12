import { getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";
import type {
  RenegotiationDetailsParams,
  RenegotiationDetailsResponse,
} from "@/modules/debt-negotiation/types/renegotiation-details";

const DETAILS_PATH = "/trinity/analytics/renegotiation/view/details";

function buildUrl(params: RenegotiationDetailsParams): string {
  const search = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    companyId: String(params.companyId),
    viewType: params.viewType ?? "daily",
    showValues: params.showValues ?? "quantity",
  });
  return `${spotApiBaseUrl}${DETAILS_PATH}?${search.toString()}`;
}

export async function fetchRenegotiationDetails(
  params: RenegotiationDetailsParams
): Promise<RenegotiationDetailsResponse> {
  const url = buildUrl(params);
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Renegotiation details API error: ${res.status}`);
  }
  return res.json();
}
