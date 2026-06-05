import { useQuery } from "@tanstack/react-query";

import { fetchQuotationById } from "@/modules/supplier/quotation/api/open-quotations-api";
import { mapQuotationApiToDetailView } from "@/modules/supplier/quotation/lib/map-quotation-detail";

export function useQuotationDetailQuery(id: string | undefined) {
  return useQuery({
    queryKey: ["supplier-quotation-detail", id],
    queryFn: async () => {
      const data = await fetchQuotationById(id!);
      return mapQuotationApiToDetailView(data);
    },
    enabled: Boolean(id),
  });
}
