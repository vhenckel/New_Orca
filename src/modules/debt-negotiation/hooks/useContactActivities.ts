import { useQuery } from "@tanstack/react-query";

import { fetchContactActivities } from "@/modules/debt-negotiation/services";
import type { ContactActivitiesResponse } from "@/modules/debt-negotiation/types";

const PAGE_SIZE = 20;

export function useContactActivities(contactId: number | null, page = 1) {
  const skip = (page - 1) * PAGE_SIZE;
  return useQuery<ContactActivitiesResponse>({
    queryKey: ["contact", "activities", contactId, page],
    queryFn: () =>
      contactId
        ? fetchContactActivities(contactId, { take: PAGE_SIZE, skip })
        : Promise.resolve({ data: [], total: 0, count: 0 }),
    enabled: Boolean(contactId),
  });
}

export { PAGE_SIZE as CONTACT_ACTIVITIES_PAGE_SIZE };

