import { getCurrentCompanyId } from "@/shared/auth/current-company";
import { spotJson } from "@/shared/api/http-client";
import type { ContactActivitiesResponse } from "@/modules/contact/types";

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
  search.append("companyIds", String(getCurrentCompanyId()));
  return spotJson<ContactActivitiesResponse>(`/contact/${contactId}/activities?${search.toString()}`);
}

