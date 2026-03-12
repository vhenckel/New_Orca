import { getDefaultCompanyId, getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";
import type { ContactActivitiesResponse } from "@/modules/debt-negotiation/types";

export interface ContactActivitiesParams {
  take: number;
  skip: number;
}

export async function fetchContactActivities(
  contactId: number,
  params: ContactActivitiesParams,
): Promise<ContactActivitiesResponse> {
  const search = new URLSearchParams({
    take: String(params.take),
    skip: String(params.skip),
  });
  search.append("companyIds", String(getDefaultCompanyId()));
  const url = `${spotApiBaseUrl}/trinity/contact/${contactId}/activities?${search.toString()}`;
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Contact activities API error: ${res.status}`);
  }
  return res.json();
}

