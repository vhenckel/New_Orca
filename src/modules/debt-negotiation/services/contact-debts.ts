import { getDefaultCompanyId, getSpotApiHeaders, spotApiBaseUrl } from "@/shared/config/env";
import type { ContactDebtsResponse } from "@/modules/debt-negotiation/types";

export async function fetchContactDebts(contactId: number): Promise<ContactDebtsResponse> {
  const search = new URLSearchParams();
  search.append("companyIds", String(getDefaultCompanyId()));
  const url = `${spotApiBaseUrl}/trinity/renegotiation/contact/${contactId}/debts?${search.toString()}`;
  const res = await fetch(url, { credentials: "omit", headers: getSpotApiHeaders() });
  if (!res.ok) {
    throw new Error(`Contact debts API error: ${res.status}`);
  }
  return res.json();
}

