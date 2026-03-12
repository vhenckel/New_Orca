import { useQuery } from "@tanstack/react-query";

import { fetchContactMetrics } from "@/modules/debt-negotiation/services";
import type { ContactMetricsResponse } from "@/modules/debt-negotiation/types";

export function useContactMetrics(contactId: number | null) {
  return useQuery<ContactMetricsResponse | null>({
    queryKey: ["contact", "metrics", contactId],
    queryFn: () => (contactId ? fetchContactMetrics(contactId) : Promise.resolve(null)),
    enabled: Boolean(contactId),
  });
}

