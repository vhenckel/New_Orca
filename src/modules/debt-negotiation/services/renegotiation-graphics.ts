import { spotJson } from "@/shared/api/http-client";
import type {
  RenegotiationGraphicsParams,
  RenegotiationGraphicsResponse,
} from "@/modules/debt-negotiation/types/renegotiation-graphics";

const GRAPHICS_PATH = "/analytics/renegotiation/view/graphics";

function buildPath(params: RenegotiationGraphicsParams): string {
  const search = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    companyId: String(params.companyId),
  });
  return `${GRAPHICS_PATH}?${search.toString()}`;
}

export async function fetchRenegotiationGraphics(
  params: RenegotiationGraphicsParams
): Promise<RenegotiationGraphicsResponse> {
  return spotJson<RenegotiationGraphicsResponse>(buildPath(params));
}
