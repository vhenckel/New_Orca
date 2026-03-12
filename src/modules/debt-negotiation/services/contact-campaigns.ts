import { getDefaultCompanyId, getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";
import type { ContactCampaignsResponse } from "@/modules/debt-negotiation/types";

export async function fetchContactCampaigns(contactId: number): Promise<ContactCampaignsResponse> {
  const search = new URLSearchParams();
  search.append("companyIds", String(getDefaultCompanyId()));
  const url = `${spotApiBaseUrl}/trinity/contact/${contactId}/campaigns?${search.toString()}`;
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Contact campaigns API error: ${res.status}`);
  }
  return res.json();
}

