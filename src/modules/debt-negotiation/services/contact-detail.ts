import { getDefaultCompanyId } from "@/shared/config/env";
import { spotJson } from "@/shared/api/http-client";
import type { ContactDetails } from "@/modules/debt-negotiation/types";

export async function fetchContactDetails(contactId: number): Promise<ContactDetails> {
  const search = new URLSearchParams();
  search.append("companyIds", String(getDefaultCompanyId()));
  return spotJson<ContactDetails>(`/contact/${contactId}/details?${search.toString()}`);
}

