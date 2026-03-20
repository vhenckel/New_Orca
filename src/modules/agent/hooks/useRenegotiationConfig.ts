import { useQuery } from "@tanstack/react-query";

import type { RenegotiationConfigDto } from "@/modules/agent/types";
import { fetchRenegotiationConfig } from "@/modules/agent/services/renegotiation-config";

export function useRenegotiationConfig(companyId: number | null) {
  return useQuery<RenegotiationConfigDto>({
    queryKey: ["agent", "renegotiation-config", companyId],
    queryFn: () => {
      if (companyId == null) throw new Error("companyId is required");
      return fetchRenegotiationConfig(companyId);
    },
    enabled: companyId != null,
  });
}

