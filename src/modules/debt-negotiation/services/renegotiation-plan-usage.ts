import { spotJson } from "@/shared/api/http-client";
import type {
  RenegotiationPlanUsageParams,
  RenegotiationPlanUsageResponse,
} from "@/modules/debt-negotiation/types/renegotiation-plan-usage";

const PLAN_USAGE_PATH = "/renegotiation/plan";

function buildPath(params: RenegotiationPlanUsageParams): string {
  const search = new URLSearchParams({
    companyId: String(params.companyId),
  });
  return `${PLAN_USAGE_PATH}?${search.toString()}`;
}

export async function fetchRenegotiationPlanUsage(
  params: RenegotiationPlanUsageParams,
): Promise<RenegotiationPlanUsageResponse> {
  return spotJson<RenegotiationPlanUsageResponse>(buildPath(params));
}
