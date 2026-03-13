import { getDefaultCompanyId } from "@/shared/config/env";
import { spotJson } from "@/shared/api/http-client";
import type { ContactMetricsResponse } from "@/modules/debt-negotiation/types";

export async function fetchContactMetrics(contactId: number): Promise<ContactMetricsResponse> {
  const search = new URLSearchParams();
  search.append("companyIds", String(getDefaultCompanyId()));
  return spotJson<ContactMetricsResponse>(`/contact/${contactId}/metrics?${search.toString()}`);
}

