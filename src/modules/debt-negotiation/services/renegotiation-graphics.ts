import { getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";
import type {
  RenegotiationGraphicsParams,
  RenegotiationGraphicsResponse,
} from "@/modules/debt-negotiation/types/renegotiation-graphics";

const GRAPHICS_PATH = "/trinity/analytics/renegotiation/view/graphics";

function buildUrl(params: RenegotiationGraphicsParams): string {
  const search = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    companyId: String(params.companyId),
  });
  return `${spotApiBaseUrl}${GRAPHICS_PATH}?${search.toString()}`;
}

export async function fetchRenegotiationGraphics(
  params: RenegotiationGraphicsParams
): Promise<RenegotiationGraphicsResponse> {
  const url = buildUrl(params);
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Renegotiation graphics API error: ${res.status}`);
  }
  return res.json();
}
