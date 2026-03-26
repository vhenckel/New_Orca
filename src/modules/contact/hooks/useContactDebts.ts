import { useQuery } from "@tanstack/react-query";

import { fetchContactDebts } from "@/modules/contact/services";
import type { ContactDebtsResponse } from "@/modules/contact/types";

export function useContactDebts(contactId: number | null) {
  return useQuery<ContactDebtsResponse>({
    queryKey: ["contact", "debts", contactId],
    queryFn: () => (contactId ? fetchContactDebts(contactId) : Promise.resolve([])),
    enabled: Boolean(contactId),
  });
}

