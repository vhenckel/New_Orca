import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { spotJson } from "@/shared/api/http-client";
import type { ContactCampaignsResponse } from "@/modules/contact/types";

export async function fetchContactCampaigns(contactId: number): Promise<ContactCampaignsResponse> {
  const search = new URLSearchParams();
  search.append("companyIds", String(getCurrentCompanyId()));
  return spotJson<ContactCampaignsResponse>(`/contact/${contactId}/campaigns?${search.toString()}`);
}

