import { useQuery } from "@tanstack/react-query";

import { fetchPersonContactQuery } from "@/modules/contact/services";
import type { PersonContactClusterResponse } from "@/modules/contact/types/person-contact";

/** Cluster 1 pessoa → N contatos (GET /contact/person/query). */
export function usePersonContactCluster(contactId: number | null) {
  return useQuery<PersonContactClusterResponse | null>({
    queryKey: ["contact", "person-cluster", contactId],
    queryFn: () =>
      contactId ? fetchPersonContactQuery(contactId) : Promise.resolve(null),
    enabled: Boolean(contactId),
  });
}
