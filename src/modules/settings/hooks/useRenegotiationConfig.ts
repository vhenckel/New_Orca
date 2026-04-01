import { useQuery } from "@tanstack/react-query";

import type { RenegotiationConfigDto } from "@/modules/settings/types";
import { fetchRenegotiationConfig } from "@/modules/settings/services/renegotiation-config";

export function useRenegotiationConfig(companyId: number | null) {
  return useQuery<RenegotiationConfigDto>({
    queryKey: ["settings", "renegotiation-config", companyId],
    queryFn: () => {
      if (companyId == null) throw new Error("companyId is required");
      return fetchRenegotiationConfig(companyId);
    },
    enabled: companyId != null,
  });
}

