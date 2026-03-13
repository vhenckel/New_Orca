import { spotJson } from "@/shared/api/http-client";
import type {
  RenegotiationBoxesParams,
  RenegotiationBoxesResponse,
} from "@/modules/debt-negotiation/types/renegotiation-boxes";

const BOXES_PATH = "/analytics/renegotiation/view/boxes";

function buildPath(params: RenegotiationBoxesParams): string {
  const search = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    companyId: String(params.companyId),
  });
  return `${BOXES_PATH}?${search.toString()}`;
}

export async function fetchRenegotiationBoxes(
  params: RenegotiationBoxesParams
): Promise<RenegotiationBoxesResponse> {
  return spotJson<RenegotiationBoxesResponse>(buildPath(params));
}
