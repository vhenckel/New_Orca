import { spotJson } from "@/shared/api/http-client";
import type {
  RenegotiationDetailsParams,
  RenegotiationDetailsResponse,
} from "@/modules/debt-negotiation/types/renegotiation-details";

const DETAILS_PATH = "/analytics/renegotiation/view/details";

function buildPath(params: RenegotiationDetailsParams): string {
  const search = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    companyId: String(params.companyId),
    viewType: params.viewType ?? "daily",
    showValues: params.showValues ?? "quantity",
  });
  return `${DETAILS_PATH}?${search.toString()}`;
}

export async function fetchRenegotiationDetails(
  params: RenegotiationDetailsParams
): Promise<RenegotiationDetailsResponse> {
  return spotJson<RenegotiationDetailsResponse>(buildPath(params));
}
