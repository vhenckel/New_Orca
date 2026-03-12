import { getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";
import type {
  RenegotiationBoxesParams,
  RenegotiationBoxesResponse,
} from "@/modules/debt-negotiation/types/renegotiation-boxes";

const BOXES_PATH = "/trinity/analytics/renegotiation/view/boxes";

function buildUrl(params: RenegotiationBoxesParams): string {
  const search = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    companyId: String(params.companyId),
  });
  return `${spotApiBaseUrl}${BOXES_PATH}?${search.toString()}`;
}

export async function fetchRenegotiationBoxes(
  params: RenegotiationBoxesParams
): Promise<RenegotiationBoxesResponse> {
  const url = buildUrl(params);
  // credentials: "omit" evita CORS quando o backend retorna Access-Control-Allow-Origin: *.
  // Com auth: enviar token no header Authorization; backend deve permitir a origem do app em CORS.
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Renegotiation boxes API error: ${res.status}`);
  }
  return res.json();
}
