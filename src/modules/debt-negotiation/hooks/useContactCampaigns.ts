import { useQuery } from "@tanstack/react-query";

import { fetchContactCampaigns } from "@/modules/debt-negotiation/services";
import type { ContactCampaignsResponse } from "@/modules/debt-negotiation/types";

export function useContactCampaigns(contactId: number | null) {
  return useQuery<ContactCampaignsResponse | null>({
    queryKey: ["contact", "campaigns", contactId],
    queryFn: () => (contactId ? fetchContactCampaigns(contactId) : Promise.resolve(null)),
    enabled: Boolean(contactId),
  });
}

