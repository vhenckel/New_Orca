import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sendQuotation } from "@/modules/supplier/quotation/api/open-quotations-api";
import type { SendQuotationPayload } from "@/modules/supplier/quotation/types/quotation-api";

export function useSendQuotationMutation(quotationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendQuotationPayload) => {
      if (!quotationId) throw new Error("Quotation id is required");
      return sendQuotation(quotationId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["supplier-quotation-detail", quotationId] });
      void queryClient.invalidateQueries({ queryKey: ["open-quotations"] });
    },
  });
}
