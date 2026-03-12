import { useQuery } from "@tanstack/react-query";

import { fetchContactDetails } from "@/modules/debt-negotiation/services";
import type { ContactDetails } from "@/modules/debt-negotiation/types";

export function useContactDetails(contactId: number | null) {
  return useQuery<ContactDetails | null>({
    queryKey: ["contact", "details", contactId],
    queryFn: () => (contactId ? fetchContactDetails(contactId) : Promise.resolve(null)),
    enabled: Boolean(contactId),
  });
}

