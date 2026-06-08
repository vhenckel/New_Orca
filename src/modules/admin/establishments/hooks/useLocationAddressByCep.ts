import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { fetchAddressByCep } from "@/modules/admin/establishments/api/establishments-api";
import { toast } from "@/shared/ui/sonner";

export function useLocationAddressByCep(cep: string, enabled = true) {
  const digits = cep.replace(/\D/g, "");

  const query = useQuery({
    queryKey: ["location", "cep", digits],
    queryFn: () => fetchAddressByCep(digits),
    enabled: enabled && digits.length === 8,
    retry: false,
  });

  useEffect(() => {
    if (query.isError) {
      toast.error("Erro ao carregar dados do CEP!");
    }
  }, [query.isError]);

  return {
    data: query.data,
    isLoading: query.isLoading || query.isFetching,
    isSuccess: query.isSuccess,
  };
}
