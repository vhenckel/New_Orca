import { getDefaultCompanyId, getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";
import type { ContactDetails } from "@/modules/debt-negotiation/types";

export async function fetchContactDetails(contactId: number): Promise<ContactDetails> {
  const search = new URLSearchParams();
  search.append("companyIds", String(getDefaultCompanyId()));
  const url = `${spotApiBaseUrl}/trinity/contact/${contactId}/details?${search.toString()}`;
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Contact details API error: ${res.status}`);
  }
  return res.json();
}

