import { apiRequest } from "@/shared/api/http-client";

export interface ProductSupplierLink {
  id: string;
  name: string;
  active: boolean;
}

export async function fetchProductSuppliers(
  productId: string,
  establishmentId: string,
): Promise<ProductSupplierLink[]> {
  return apiRequest<ProductSupplierLink[]>(
    `/product-supplier/${productId}/establishment/${establishmentId}`,
  );
}

export async function updateProductSuppliers(
  productId: string,
  establishmentId: string,
  body: { supplierIds: string[]; active: boolean },
): Promise<void> {
  await apiRequest<void>(`/product-supplier/${productId}/establishment/${establishmentId}`, {
    method: "PUT",
    body,
  });
}
