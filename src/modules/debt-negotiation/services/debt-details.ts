import { getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";
import type {
  DebtDetailsParams,
  DebtDetailsResponse,
} from "@/modules/debt-negotiation/types/debt-details";

const DEBT_DETAILS_PATH = "/trinity/analytics/renegotiation/view/debt-details";

function buildUrl(params: DebtDetailsParams): string {
  const search = new URLSearchParams({
    take: String(params.take),
    skip: String(params.skip),
    startDate: params.startDate,
    endDate: params.endDate,
    companyId: String(params.companyId),
  });
  if (params.orderBy) search.set("orderBy", params.orderBy);
  if (params.orderByDirection) search.set("orderByDirection", params.orderByDirection);
  return `${spotApiBaseUrl}${DEBT_DETAILS_PATH}?${search.toString()}`;
}

export async function fetchDebtDetails(
  params: DebtDetailsParams
): Promise<DebtDetailsResponse> {
  const url = buildUrl(params);
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Debt details API error: ${res.status}`);
  }
  return res.json();
}
