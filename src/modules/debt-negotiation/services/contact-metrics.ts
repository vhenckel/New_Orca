import { getDefaultCompanyId, getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";
import type { ContactMetricsResponse } from "@/modules/debt-negotiation/types";

export async function fetchContactMetrics(contactId: number): Promise<ContactMetricsResponse> {
  const search = new URLSearchParams();
  search.append("companyIds", String(getDefaultCompanyId()));
  const url = `${spotApiBaseUrl}/trinity/contact/${contactId}/metrics?${search.toString()}`;
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Contact metrics API error: ${res.status}`);
  }
  return res.json();
}

