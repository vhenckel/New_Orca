import { spotJson } from "@/shared/api/http-client";
import type {
  DebtDetailsParams,
  DebtDetailsResponse,
} from "@/modules/debt-negotiation/types/debt-details";

/** Alinhado ao management: debt-details vs negotiated-details vs recovered-details. */
export type RenegotiationViewListVariant = "renegotiation" | "negotiated" | "recovered";

const PATH: Record<RenegotiationViewListVariant, string> = {
  renegotiation: "/analytics/renegotiation/view/debt-details",
  negotiated: "/analytics/renegotiation/view/negotiated-details",
  recovered: "/analytics/renegotiation/view/recovered-details",
};

export function buildRenegotiationViewListQuery(params: DebtDetailsParams): string {
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
  return search.toString();
}

export async function fetchRenegotiationViewList(
  variant: RenegotiationViewListVariant,
  params: DebtDetailsParams,
): Promise<DebtDetailsResponse> {
  const q = buildRenegotiationViewListQuery(params);
  return spotJson<DebtDetailsResponse>(`${PATH[variant]}?${q}`);
}
