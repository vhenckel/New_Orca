import { useQuery } from "@tanstack/react-query";

import { fetchContactMetrics } from "@/modules/contact/services";
import type { ContactMetricsResponse } from "@/modules/contact/types";

export function useContactMetrics(contactId: number | null) {
  return useQuery<ContactMetricsResponse | null>({
    queryKey: ["contact", "metrics", contactId],
    queryFn: () => (contactId ? fetchContactMetrics(contactId) : Promise.resolve(null)),
    enabled: Boolean(contactId),
  });
}

