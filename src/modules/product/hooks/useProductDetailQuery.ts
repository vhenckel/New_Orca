import { useQuery } from "@tanstack/react-query";

import {
  fetchEstablishmentProductById,
  mapEstablishmentProductToDetailView,
} from "@/modules/product/api/establishment-products-api";
import {
  fetchProductById,
  mapPlatformProductToDetailView,
} from "@/modules/product/api/products-api";
import type { ProductDetailView } from "@/modules/product/types/product-detail";
import type { ApiUserRole } from "@/shared/auth/types";
import { getStoredUser } from "@/shared/auth/token-store";

export function productDetailQueryKey(id: string, role: ApiUserRole | null) {
  const userId = getStoredUser()?.id ?? "anonymous";
  return ["product", "detail", userId, role, id] as const;
}

async function fetchProductDetail(
  id: string,
  role: ApiUserRole | null,
): Promise<ProductDetailView> {
  if (role === "establishment") {
    const product = await fetchEstablishmentProductById(id);
    return mapEstablishmentProductToDetailView(product);
  }
  const product = await fetchProductById(id);
  return mapPlatformProductToDetailView(product);
}

export function useProductDetailQuery(id: string | undefined, role: ApiUserRole | null) {
  return useQuery({
    queryKey: productDetailQueryKey(id ?? "", role),
    queryFn: () => fetchProductDetail(id!, role),
    enabled: Boolean(id) && (role === "admin" || role === "establishment"),
  });
}
