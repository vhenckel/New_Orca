import { getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";
import type {
  RenegotiationNpsParams,
  RenegotiationNpsResponse,
} from "@/modules/debt-negotiation/types/renegotiation-nps";

const NPS_PATH = "/trinity/analytics/renegotiation/view/nps";

function buildUrl(params: RenegotiationNpsParams): string {
  const search = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    companyId: String(params.companyId),
  });
  return `${spotApiBaseUrl}${NPS_PATH}?${search.toString()}`;
}

export async function fetchRenegotiationNps(
  params: RenegotiationNpsParams
): Promise<RenegotiationNpsResponse> {
  const url = buildUrl(params);
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Renegotiation NPS API error: ${res.status}`);
  }
  return res.json();
}
