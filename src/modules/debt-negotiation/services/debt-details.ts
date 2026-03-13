import { spotJson } from "@/shared/api/http-client";
import type {
  DebtDetailsParams,
  DebtDetailsResponse,
} from "@/modules/debt-negotiation/types/debt-details";

const DEBT_DETAILS_PATH = "/analytics/renegotiation/view/debt-details";

function buildPath(params: DebtDetailsParams): string {
  const search = new URLSearchParams({
    take: String(params.take),
    skip: String(params.skip),
    startDate: params.startDate,
    endDate: params.endDate,
    companyId: String(params.companyId),
  });
  if (params.orderBy) search.set("orderBy", params.orderBy);
  if (params.orderByDirection) search.set("orderByDirection", params.orderByDirection);
  params.statuses?.forEach((s) => search.append("statuses[]", String(s)));
  if (params.name) search.set("name", params.name);
  if (params.document) search.set("document", params.document);
  return `${DEBT_DETAILS_PATH}?${search.toString()}`;
}

export async function fetchDebtDetails(
  params: DebtDetailsParams
): Promise<DebtDetailsResponse> {
  return spotJson<DebtDetailsResponse>(buildPath(params));
}
