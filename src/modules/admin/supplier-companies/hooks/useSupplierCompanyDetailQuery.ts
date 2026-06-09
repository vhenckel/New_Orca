import { useQuery } from "@tanstack/react-query";

import { fetchSupplierCompanyById } from "@/modules/admin/supplier-companies/api/supplier-companies-api";

export function supplierCompanyDetailQueryKey(id: string) {
  return ["supplier-companies", "detail", id] as const;
}

export function useSupplierCompanyDetailQuery(id: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: supplierCompanyDetailQueryKey(id ?? ""),
    queryFn: () => fetchSupplierCompanyById(id!),
    enabled: (options?.enabled ?? true) && Boolean(id),
    retry: false,
  });
}
