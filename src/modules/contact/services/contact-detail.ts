import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { spotJson } from "@/shared/api/http-client";
import type { ContactDetails } from "@/modules/contact/types";

export async function fetchContactDetails(contactId: number): Promise<ContactDetails> {
  const search = new URLSearchParams();
  search.append("companyIds", String(getCurrentCompanyId()));
  return spotJson<ContactDetails>(`/contact/${contactId}/details?${search.toString()}`);
}

