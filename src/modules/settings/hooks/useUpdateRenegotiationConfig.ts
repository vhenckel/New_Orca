import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { RenegotiationConfigPayload } from "@/modules/settings/types";
import { updateRenegotiationConfig } from "@/modules/settings/services/renegotiation-config";

export function useUpdateRenegotiationConfig(companyId: number | null, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RenegotiationConfigPayload) => {
      if (companyId == null) throw new Error("companyId is required");
      await updateRenegotiationConfig(companyId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings", "renegotiation-config", companyId] });
      onSuccess?.();
    },
  });
}

