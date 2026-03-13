import { spotJson } from "@/shared/api/http-client";
import type {
  RenegotiationNpsParams,
  RenegotiationNpsResponse,
} from "@/modules/debt-negotiation/types/renegotiation-nps";

const NPS_PATH = "/analytics/renegotiation/view/nps";

function buildPath(params: RenegotiationNpsParams): string {
  const search = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    companyId: String(params.companyId),
  });
  return `${NPS_PATH}?${search.toString()}`;
}

export async function fetchRenegotiationNps(
  params: RenegotiationNpsParams
): Promise<RenegotiationNpsResponse> {
  return spotJson<RenegotiationNpsResponse>(buildPath(params));
}
