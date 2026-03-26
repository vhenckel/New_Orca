import { useQuery } from "@tanstack/react-query";

import { fetchContactDetails } from "@/modules/contact/services";
import type { ContactDetails } from "@/modules/contact/types";

export function useContactDetails(contactId: number | null) {
  return useQuery<ContactDetails | null>({
    queryKey: ["contact", "details", contactId],
    queryFn: () => (contactId ? fetchContactDetails(contactId) : Promise.resolve(null)),
    enabled: Boolean(contactId),
  });
}

