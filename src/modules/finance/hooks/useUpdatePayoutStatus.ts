import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdatePayoutStatusPayload } from "@/modules/finance/types/payouts";
import { updatePayoutStatus } from "@/modules/finance/services/payouts";

export function useUpdatePayoutStatus(payoutId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdatePayoutStatusPayload) => {
      if (payoutId == null) return;
      await updatePayoutStatus(payoutId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance", "payout-list"] });
      await queryClient.invalidateQueries({ queryKey: ["finance", "payout-details"] });
      await queryClient.invalidateQueries({ queryKey: ["finance", "payout-invoice"] });
    },
  });
}
