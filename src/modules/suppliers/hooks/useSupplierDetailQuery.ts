import { useQuery } from "@tanstack/react-query";

import { fetchSupplierById } from "@/modules/suppliers/api/suppliers-api";

export function supplierDetailQueryKey(id: string) {
  return ["suppliers", "detail", id] as const;
}

export function useSupplierDetailQuery(id: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: supplierDetailQueryKey(id ?? ""),
    queryFn: () => fetchSupplierById(id!),
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}
